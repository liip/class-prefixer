import * as ts from 'typescript';

import { parseTsClassArguments } from './parse-ts-class-arguments';
import { parseTsSelectorArguments } from './parse-ts-selector-arguments';

import type { PrefixerOptions } from '@liip/class-prefixer-core';

export const createTsTransformer =
  (visitor: ts.Visitor) =>
  (context: ts.TransformationContext) =>
  (rootNode: ts.Node) => {
    const visit = (node: ts.Node) =>
      visitor(ts.visitEachChild(node, visit, context));

    return ts.visitNode(rootNode, visit);
  };

/**
 * Walk through an AST representation of the provided source to replace placeholders
 * used in the files by the prefixed string used as arguments
 */
export const createTsTransformerWithConfig = (config?: PrefixerOptions) => {
  return createTsTransformer((node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      /**
       * Handle `classPrefixer` expression
       */
      if (node.expression.text === 'classPrefixer') {
        return parseTsClassArguments(node.arguments[0], config);
      }

      /**
       * Handle `selectorPrefixer` expression
       */
      if (node.expression.text === 'selectorPrefixer') {
        /**
         * We only support a string argument in the `selectorPrefixer`
         */
        if (!ts.isStringLiteral(node.arguments[0])) {
          throw new Error(
            `[ClassPrefixerAstVisitor]: 'selectorPrefixer' hook cannot be used with a non-string argument. You provided '${
              ts.SyntaxKind[node.arguments[0].kind]
            }'`,
          );
        }

        return parseTsSelectorArguments(node.arguments[0], config);
      }
    }

    return node;
  });
};
