import {
  SFCDescriptor,
  SFCScriptBlock,
  compileScript,
} from '@vue/compiler-sfc';
import { fromObject } from 'convert-source-map';
import { PartialMessage } from 'esbuild';

import { getDescriptorCache, getId } from './cache';
import { EsbuildAstParserVueOptions } from './plugin';
import { getTemplateOptions } from './template';

export const scriptCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>();

export function resolveScript({
  filename,
  scriptOptions = {},
  templateOptions = {},
  isProd,
  sourcemap,
}: {
  filename: string;
  scriptOptions: EsbuildAstParserVueOptions['scriptOptions'];
  templateOptions: EsbuildAstParserVueOptions['templateOptions'];
  isProd: boolean;
  sourcemap: boolean;
}) {
  const descriptor = getDescriptorCache(filename);

  const cached = scriptCache.get(descriptor);

  if (cached) {
    return {
      code: cached.content,
      isTs: cached.lang === 'ts',
      error: [],
    };
  }

  const error: PartialMessage[] = [];
  const { script, scriptSetup } = descriptor;
  const isTs =
    (script && script.lang === 'ts') ||
    (scriptSetup && scriptSetup.lang === 'ts');

  let code = 'export default {}';
  if (!descriptor.script && !descriptor.scriptSetup) {
    return {
      code,
    };
  }

  const scopeId = getId(filename);
  try {
    const res = compileScript(descriptor, {
      id: scopeId,
      isProd,
      sourceMap: sourcemap,
      inlineTemplate: true,
      babelParserPlugins: scriptOptions.babelParserPlugins,
      templateOptions: descriptor.template
        ? getTemplateOptions({
            descriptor,
            options: templateOptions,
            isProd,
            scopeId,
          })
        : {},
    });

    code = res.content;

    if (res.map) {
      code += fromObject(res.map).toComment();
    }

    scriptCache.set(descriptor, res);
  } catch (e: any) {
    error.push({
      text: e.message,
    });
  }

  return {
    code,
    error,
    isTs,
  };
}
