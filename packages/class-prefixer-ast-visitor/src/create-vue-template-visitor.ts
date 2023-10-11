import { parseClassArguments } from './parse-class-arguments';

import type { PrefixerOptions } from '@liip/class-prefixer-core';
import type { Visitor } from 'estraverse';

/**
 * Walk through an AST representation of the provided source to replace placeholders
 * used in the files by the prefixed string used as arguments
 */
export const createVueTemplateVisitor = (config: PrefixerOptions): Visitor => ({
  enter(node) {
    if (
      node.type === 'Property' &&
      node.key.type === 'Identifier' &&
      node.key.name === 'class'
    ) {
      return {
        ...node,
        value: parseClassArguments(node.value, config),
      };
    }
  },
});
