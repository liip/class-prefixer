import type { Prefixer, PrefixerOptions } from '@liip/class-prefixer-core';
import type { Literal, TemplateLiteral } from 'estree';

/**
 * Update `Literal` and `TemplateLiteral` nodes with prefixed value
 */
export function updateLiterals(
  node: Literal | TemplateLiteral,
  prefixer: Prefixer,
  options?: PrefixerOptions,
) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    const value: string = prefixer(node.value, options);

    return {
      ...node,
      value,
      raw: `'${value}'`,
    };
  }

  if (node.type === 'TemplateLiteral') {
    const newNode: TemplateLiteral = {
      ...node,
      quasis: node.quasis.map((node) => ({
        ...node,
        value: {
          ...node.value,
          raw: prefixer(node.value.raw, options),
        },
      })),
    };

    return newNode;
  }

  return node;
}
