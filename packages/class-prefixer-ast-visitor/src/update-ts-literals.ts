import * as ts from 'typescript';

import type { Prefixer, PrefixerOptions } from '@liip/class-prefixer-core';

/**
 * Update `StringLiteral` and `TemplateLiteral` nodes with prefixed value
 */
export function updateTsLiterals(
  node: ts.StringLiteral | ts.TemplateLiteral,
  prefixer: Prefixer,
  options?: PrefixerOptions,
): ts.StringLiteral | ts.TemplateLiteral {
  if (ts.isStringLiteral(node)) {
    const value: string = prefixer(node.text, options);

    return ts.factory.createStringLiteral(value);
  }

  if (
    ts.isTemplateExpression(node) ||
    ts.isNoSubstitutionTemplateLiteral(node)
  ) {
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      return ts.factory.createNoSubstitutionTemplateLiteral(
        prefixer(node.text, options),
      );
    }

    const newHead = ts.factory.createTemplateHead(
      node.head.text
        ? prefixer(node.head.text, options)
        : options?.prefix?.value || '',
    );

    const newSpans = node.templateSpans.map((span) => {
      const newLiteral = ts.isTemplateMiddle(span.literal)
        ? ts.factory.createTemplateMiddle(span.literal.text)
        : ts.factory.createTemplateTail(span.literal.text);
      return ts.factory.createTemplateSpan(span.expression, newLiteral);
    });

    return ts.factory.updateTemplateExpression(node, newHead, newSpans);
  }

  return node;
}
