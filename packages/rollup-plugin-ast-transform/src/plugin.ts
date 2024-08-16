import { basename } from 'node:path';

import { AstParserVisitors, jsParser } from '@liip/ast-parsers';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { Plugin } from 'rollup';

export type PluginAstTransformOptions = {
  include?: FilterPattern;
  exclude?: FilterPattern;
  visitors: AstParserVisitors;
};

export function astTransform({
  include,
  exclude,
  visitors,
}: PluginAstTransformOptions): Plugin {
  const shouldProcess = createFilter(include, exclude);

  return {
    name: 'class-prefixer',
    transform(source, id) {
      if (!shouldProcess(id)) {
        return null;
      }

      const { code, map } = jsParser({
        source,
        file: basename(id),
        visitors,
      });

      return { code, map: map?.toString() ?? null };
    },
  };
}
