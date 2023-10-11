import { prefixer, PrefixerOptions } from '@liip/class-prefixer-core';

import { updateLiterals } from './update-literals';

import type { Node } from 'estree';

const selectorRegex = /[^a-zA-Z\d\s:_-]/;

/**
 * Parse the argument to produce prefixed classes. We accept arrays
 * and objects so we need to recurse to parse everything
 */
export function parseClassArguments<N extends Node>(
  node: N,
  options?: PrefixerOptions,
): N {
  if (node.type === 'CallExpression' && node.arguments) {
    return {
      ...node,
      arguments: node.arguments.map(
        (argument) => argument && parseClassArguments(argument, options),
      ),
    };
  } else if (node.type === 'ArrayExpression' && node.elements) {
    return {
      ...node,
      elements: node.elements.map(
        (element) => element && parseClassArguments(element, options),
      ),
    };
  } else if (node.type === 'ObjectExpression') {
    return {
      ...node,
      properties: node.properties.map((property) =>
        parseClassArguments(property, options),
      ),
    };
  } else if (node.type === 'Property') {
    return {
      ...node,
      key: parseClassArguments(node.key, options),
    };
  } else if (node.type === 'TemplateLiteral' || node.type === 'Literal') {
    if (
      (node.type === 'Literal' &&
        typeof node.value === 'string' &&
        node.value?.search(selectorRegex) !== -1) ||
      (node.type === 'TemplateLiteral' &&
        node.quasis[0].value.raw.search(selectorRegex) !== -1)
    ) {
      throw new Error(
        'It seems you passed a css selector in the "classPrefixer" function argument. This function only accepts plain class names. Consider using the "selectorPrefixer" if you need to prefix css selectors',
      );
    }

    return updateLiterals(node, prefixer, options) as N;
  }

  return node;
}
