import { Parser } from 'acorn';
import { generate } from 'astring';
import { replace, Visitor } from 'estraverse';
import { SourceMapGenerator } from 'source-map';

import { isFunction } from './utils';

import type { Node } from 'estree';

export type AstParserVisitors = Visitor | Visitor[] | undefined;
export type JsParserOptions = {
  source: string;
  file: string;
  visitors?: AstParserVisitors;
};

/**
 * Create an AST representation of the provided source and use the
 * visitor object to transform it if provided
 */
export function jsParser({ source, file, visitors }: JsParserOptions) {
  if (!visitors) {
    /* eslint-disable-next-line no-console */
    console.warn(
      '[esbuildPluginAst]: No javascript visitor provided, the plugin will have no effect.',
    );
    return { code: source, ast: null, map: null };
  }

  const ast = Parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true,
  }) as Node;

  return transformer({ ast, file, visitors, source });
}

type TransformerOptions<N extends Node> = {
  ast: N;
  file: string;
  visitors?: AstParserVisitors;
  source: string;
};

export function transformer<N extends Node>({
  ast,
  file,
  visitors,
  source,
}: TransformerOptions<N>) {
  const visitorArray = Array.isArray(visitors) ? visitors : [visitors];

  let newAst = structuredClone(ast);

  for (const visitor of visitorArray) {
    if (
      typeof visitor === 'undefined' ||
      (!isFunction(visitor?.enter) && !isFunction(visitor?.leave))
    ) {
      continue;
    }

    newAst = replace(newAst, visitor) as N;
  }

  const map = new SourceMapGenerator({ file });
  map.setSourceContent(file, source);

  const code = generate(newAst, { sourceMap: map });

  return { code, ast: newAst, map };
}
