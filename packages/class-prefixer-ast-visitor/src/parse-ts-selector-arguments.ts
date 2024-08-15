import { selectorPrefixer, PrefixerOptions } from '@liip/class-prefixer-core';
import * as ts from 'typescript';

import { updateTsLiterals } from './update-ts-literals';

/**
 * Parse the argument to produce prefixed selectors. We only accept
 * string argument as selectors
 */
export function parseTsSelectorArguments(
  node: ts.Node,
  options?: PrefixerOptions,
): ts.StringLiteral | ts.TemplateLiteral {
  if (!ts.isStringLiteral(node) && !ts.isTemplateLiteral(node)) {
    throw new Error(
      `"selectorPrefixer" only accepts string literals or template literals as arguments. You passed ${
        ts.SyntaxKind[node.kind]
      }`,
    );
  }

  return updateTsLiterals(node, selectorPrefixer, options);
}
