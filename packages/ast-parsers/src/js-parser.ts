import { Parser } from 'acorn';
import { generate } from 'astring';
import { replace, Visitor } from 'estraverse';
import { SourceMapGenerator } from 'source-map';

import { isFunction } from './utils';

import type { Node } from 'estree';

export type AstParserVisitors = Visitor | Visitor[] | undefined;

/**
 * Create an AST representation of the provided source and use the
 * visitor object to transform it if provided
 */
export function jsParser(
  source: string,
  file: string,
  visitors?: AstParserVisitors,
) {
  if (!visitors) {
    /* eslint-disable-next-line no-console */
    console.warn(
      '[esbuildPluginAst]: No javascript visitor provided, the plugin will have no effect.',
    );
    return { code: source };
  }

  const ast = Parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }) as Node;

  return transformer({ ast, file, visitors });
}

type TransformerOptions<N extends Node> = {
  ast: N;
  file: string;
  visitors?: AstParserVisitors;
};

export function transformer<N extends Node>({
  ast,
  file,
  visitors,
}: TransformerOptions<N>) {
  const visitorArray = Array.isArray(visitors) ? visitors : [visitors];

  let newAst = ast;

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

  return { code: generate(newAst, { sourceMap: map }), ast: newAst, map };
}
