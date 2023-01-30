import { compileScript } from '@vue/compiler-sfc';
import { fromObject } from 'convert-source-map';
import { PartialMessage } from 'esbuild';

import { getDescriptorCache, getId } from './cache';
import { getTemplateOptions } from './template';

import type { AstParserVueOptions } from './plugin';

export function resolveScript({
  filename,
  scriptOptions = {},
  templateOptions = {},
  isProd,
  sourcemap,
}: {
  filename: string;
  scriptOptions: AstParserVueOptions['scriptOptions'];
  templateOptions: AstParserVueOptions['templateOptions'];
  isProd: boolean;
  sourcemap: boolean;
}) {
  const descriptor = getDescriptorCache(filename);
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
        ? getTemplateOptions({ descriptor, options: templateOptions, isProd })
        : {},
    });

    code = res.content;
    if (res.map) {
      code += fromObject(res.map).toComment();
    }
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
