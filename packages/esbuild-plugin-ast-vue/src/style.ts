import { compileStyleAsync, SFCStyleCompileOptions } from '@vue/compiler-sfc';
import { fromObject } from 'convert-source-map';
import { PartialMessage } from 'esbuild';

import { getDescriptorCache, getId } from './cache';

import type { AstParserVueOptions } from './plugin';

export async function resolveStyle({
  filename,
  styleOptions = {},
  index,
  isModule,
  moduleWithNameImport,
  isProd,
}: {
  filename: string;
  styleOptions: AstParserVueOptions['styleOptions'];
  index: number;
  isModule: boolean;
  moduleWithNameImport: boolean;
  isProd: boolean;
}) {
  const descriptor = getDescriptorCache(filename);
  const styleBlock = descriptor.styles[index];
  const scopeId = getId(filename);

  const res = await compileStyleAsync({
    source: styleBlock.content,
    filename: descriptor.filename,
    id: scopeId,
    scoped: styleBlock.scoped,
    trim: true,
    isProd,
    inMap: styleBlock.map,
    preprocessLang: styleBlock.lang as SFCStyleCompileOptions['preprocessLang'],
    preprocessOptions: styleOptions.preprocessOptions,
    postcssOptions: styleOptions.postcssOptions,
    postcssPlugins: styleOptions.postcssPlugins,
    modules: isModule,
    modulesOptions: styleOptions.modulesOptions,
  });
  let styleCode: string;
  if (moduleWithNameImport) {
    // css-modules JSON file
    styleCode = JSON.stringify(res.modules);
  } else {
    // normal css content
    styleCode = res.code;
  }

  if (res.map && !moduleWithNameImport) {
    styleCode += fromObject(res.map).toComment({ multiline: true });
  }
  const errors: PartialMessage[] = res.errors.map((e) => ({
    text: e.message,
  }));

  return {
    errors,
    styleCode,
  };
}
