import {
  compileTemplate,
  SFCDescriptor,
  SFCTemplateCompileOptions,
} from '@vue/compiler-sfc';
import { fromObject } from 'convert-source-map';
import { PartialMessage } from 'esbuild';

import { getDescriptorCache, getId } from './cache';

import type { AstParserVueOptions } from './plugin';

export function resolveTemplate({
  filename,
  options = {},
  isProd,
}: {
  filename: string;
  options: AstParserVueOptions['templateOptions'];
  isProd: boolean;
}) {
  const descriptor = getDescriptorCache(filename);

  let { code, errors, map } = compileTemplate(
    getTemplateOptions({ descriptor, options, isProd }),
  );

  if (map) {
    code += fromObject(map).toComment();
  }

  const convertedErrors: PartialMessage[] = errors.map((e) => {
    if (typeof e === 'string') {
      return {
        text: e,
      };
    } else {
      return {
        text: e.message,
      };
    }
  });

  return {
    code,
    errors: convertedErrors,
  };
}

export function getTemplateOptions({
  descriptor,
  options,
  isProd,
}: {
  descriptor: SFCDescriptor;
  options: AstParserVueOptions['templateOptions'];
  isProd: boolean;
}): SFCTemplateCompileOptions {
  const filename = descriptor.filename;
  const scopeId = getId(filename);

  return {
    source: descriptor.template?.content || '',
    filename,
    id: scopeId,
    scoped: descriptor.styles.some((s) => s.scoped),
    isProd,
    inMap: descriptor.template?.map,
    compiler: options?.compiler,
    preprocessLang: options?.preprocessLang,
    preprocessOptions: options?.preprocessOptions,
    compilerOptions: {
      ...options?.compilerOptions,
      scopeId,
    },
    transformAssetUrls: options?.transformAssetUrls,
  };
}
