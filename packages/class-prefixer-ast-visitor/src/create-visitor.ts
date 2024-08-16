import { parseClassArguments } from './parse-class-arguments';
import { parseSelectorArguments } from './parse-selector-arguments';

import type { PrefixerOptions } from '@liip/class-prefixer-core';
import type { Visitor } from 'estraverse';

/**
 * Walk through an AST representation of the provided source to replace placeholders
 * used in the files by the prefixed string used as arguments
 */
export const createVisitor = (config?: PrefixerOptions): Visitor => ({
  enter(node) {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
      /**
       * Handle `classPrefixer` expression
       */
      if (node.callee.name === 'classPrefixer') {
        return parseClassArguments(node.arguments[0], config, node.loc);
      }

      /**
       * Handle `selectorPrefixer` expression
       */
      if (node.callee.name === 'selectorPrefixer') {
        /**
         * We only support a string argument in the `selectorPrefixer`
         */
        if (node.arguments[0].type !== 'Literal') {
          throw new Error(
            `[ClassPrefixerAstVisitor]: 'selectorPrefixer' hook cannot be used with a non-string argument. You provide '${node.arguments[0].type}'`,
          );
        }

        return parseSelectorArguments(node.arguments[0], config, node.loc);
      }
    }
  },
});
