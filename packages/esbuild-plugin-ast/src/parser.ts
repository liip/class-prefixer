import { Parser } from 'acorn';
import { generate } from 'astring';
import { replace, Visitor } from 'estraverse';

import type { Node } from 'estree';

const isFunction = (v: unknown) =>
  [
    '[object Function]',
    '[object GeneratorFunction]',
    '[object AsyncFunction]',
    '[object Promise]',
  ].includes(Object.prototype.toString.call(v));

/**
 * Create an AST representation of the provided source and use the
 * visitor object to transform it if provided
 */
export function parser(source: string, visitors: Visitor | Visitor[]) {
  if (!visitors) {
    /* eslint-disable-next-line no-console */
    console.warn(
      '[esbuildPluginAst]: No visitor provided, the plugin will have no effect.',
    );
    return source;
  }

  const visitorArray = Array.isArray(visitors) ? visitors : [visitors];

  let ast = Parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }) as Node;

  for (const visitor of visitorArray) {
    if (!isFunction(visitor.enter) && !isFunction(visitor.leave)) {
      continue;
    }

    ast = replace(ast, visitor);
  }

  return generate(ast);
}
