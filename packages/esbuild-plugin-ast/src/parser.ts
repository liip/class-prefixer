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
export function parser(source: string, visitor: Visitor) {
  if (!visitor) {
    /* eslint-disable-next-line no-console */
    console.warn(
      '[esbuildPluginAst]: No visitor provided, the plugin will have no effect.',
    );
    return source;
  }

  if (!isFunction(visitor.enter) && !isFunction(visitor.leave)) {
    return source;
  }

  const ast = Parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }) as Node;

  const newAst = replace(ast, visitor);

  return generate(newAst);
}
