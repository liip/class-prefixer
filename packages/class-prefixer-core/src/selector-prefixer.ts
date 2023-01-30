import { parse, stringify, SelectorNode } from 'css-selector-tokenizer';

import { PrefixerOptions, prefixer } from './prefixer';

export type SelectorPrefixer = (
  value: string,
  options?: PrefixerOptions,
) => string;

/**
 * Use a parsed selector AST to correctly add the prefix on each of the
 * descendant nodes
 */
function walkSelectorNode(
  nodes: SelectorNode[],
  options?: PrefixerOptions,
): SelectorNode[] {
  return nodes.map((node) => ({
    ...node,
    nodes: node.nodes.map((node) => {
      if (node.type === 'nested-pseudo-class') {
        return { ...node, nodes: walkSelectorNode(node.nodes, options) };
      }

      if (node.type === 'class' && node.name !== options?.prefix?.value) {
        return { ...node, name: prefixer(node.name, options) };
      }

      return node;
    }),
  }));
}

export const selectorPrefixer: SelectorPrefixer = (value, options) => {
  if (!options || !options.prefix?.value) {
    return value;
  }

  const selectors = parse(value);

  selectors.nodes = walkSelectorNode(selectors.nodes, options);

  return stringify(selectors);
};
