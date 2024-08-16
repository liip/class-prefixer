import type { Prefixer, PrefixerOptions } from '@liip/class-prefixer-core';
import type { Literal, SourceLocation, TemplateLiteral } from 'estree';

export type UpdateLiteralsOptions = {
  node: Literal | TemplateLiteral;
  prefixer: Prefixer;
  options?: PrefixerOptions;
  loc?: SourceLocation | null;
};

/**
 * Update `Literal` and `TemplateLiteral` nodes with prefixed value
 */
export function updateLiterals({
  node,
  prefixer,
  options,
  loc,
}: UpdateLiteralsOptions) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    const value: string = prefixer(node.value, options);

    return {
      ...node,
      value,
      raw: `'${value}'`,
      loc,
    };
  }

  if (node.type === 'TemplateLiteral') {
    const newNode: TemplateLiteral = {
      ...node,
      loc,
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
