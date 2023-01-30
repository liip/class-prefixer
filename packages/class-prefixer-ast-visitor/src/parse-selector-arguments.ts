import { selectorPrefixer, PrefixerOptions } from '@liip/class-prefixer-core';

import { updateLiterals } from './update-literals';

import type { Node } from 'estree';

/**
 * Parse the argument to produce prefixed selectors. We only accept
 * string argument as selectors
 */
export function parseSelectorArguments(node: Node, options?: PrefixerOptions) {
  if (node.type !== 'TemplateLiteral' && node.type !== 'Literal') {
    throw new Error(
      `"selectorPrefixer" only accept string or template literal argument. You passed ${node.type}`,
    );
  }

  return updateLiterals(node, selectorPrefixer, options);
}
