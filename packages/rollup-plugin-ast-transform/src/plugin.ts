import { AstParserVisitors, transformer } from '@liip/ast-parsers';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { Plugin } from 'rollup';

export type PluginAstTransformOptions = {
  include?: FilterPattern;
  exclude?: FilterPattern;
  visitors: AstParserVisitors;
};

export default function astTransform({
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

      const ast = this.parse(source, { allowReturnOutsideFunction: true });

      const {
        code,
        ast: transformedAst,
        map,
      } = transformer({
        ast,
        file: id,
        visitors,
      });

      return { code, ast: transformedAst, map: map.toString() };
    },
  };
}
