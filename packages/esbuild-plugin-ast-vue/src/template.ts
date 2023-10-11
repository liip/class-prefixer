import {
  compileTemplate,
  SFCDescriptor,
  SFCTemplateCompileOptions,
} from '@vue/compiler-sfc';
import { fromObject } from 'convert-source-map';
import { PartialMessage } from 'esbuild';

import { getDescriptorCache, getId } from './cache';
import { scriptCache } from './script';

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
  const scopeId = getId(filename);

  let { code, errors, map } = compileTemplate({
    ...getTemplateOptions({ descriptor, options, isProd, scopeId }),
    id: scopeId,
    source: descriptor.template?.content || '',
    filename: descriptor.filename,
  });

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
  scopeId,
}: {
  descriptor: SFCDescriptor;
  options: AstParserVueOptions['templateOptions'];
  isProd: boolean;
  scopeId: string;
}): Omit<SFCTemplateCompileOptions, 'source'> | undefined {
  const block = descriptor.template;

  if (!block) {
    return;
  }

  const hasScoped = descriptor.styles.some((s) => s.scoped);
  const resolvedScript = scriptCache.get(descriptor);

  return {
    id: scopeId,
    scoped: hasScoped,
    isProd,
    filename: descriptor.filename,
    inMap: block.src ? undefined : block.map,
    compiler: options?.compiler,
    compilerOptions: {
      ...options?.compilerOptions,
      scopeId,
      bindingMetadata: resolvedScript ? resolvedScript.bindings : undefined,
    },
    transformAssetUrls: options?.transformAssetUrls,
  };
}
