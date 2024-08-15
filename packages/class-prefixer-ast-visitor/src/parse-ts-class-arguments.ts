import { prefixer, PrefixerOptions } from '@liip/class-prefixer-core';
import * as ts from 'typescript';

import { updateTsLiterals } from './update-ts-literals';

const selectorRegex = /[^a-zA-Z\d\s:_-]/;

/**
 * Parse the argument to produce prefixed classes. We accept arrays
 * and objects so we need to recurse to parse everything.
 */
export function parseTsClassArguments<N extends ts.Node>(
  node: N,
  options?: PrefixerOptions,
): ts.Node {
  if (ts.isCallExpression(node) && node.arguments) {
    return ts.factory.updateCallExpression(
      node,
      node.expression,
      node.typeArguments,
      node.arguments.map((argument) => {
        if (ts.isPropertyAccessExpression(argument)) {
          return argument;
        }

        return argument
          ? (parseTsClassArguments(argument, options) as ts.Expression)
          : argument;
      }),
    );
  } else if (ts.isArrayLiteralExpression(node) && node.elements) {
    return ts.factory.updateArrayLiteralExpression(
      node,
      node.elements.map((element) => {
        if (ts.isPropertyAccessExpression(element)) {
          return element;
        }

        return element
          ? (parseTsClassArguments(element, options) as ts.Expression)
          : element;
      }),
    );
  } else if (ts.isObjectLiteralExpression(node)) {
    return ts.factory.updateObjectLiteralExpression(
      node,
      node.properties.map(
        (property) =>
          parseTsClassArguments(property, options) as ts.PropertyAssignment,
      ),
    );
  } else if (ts.isPropertyAssignment(node)) {
    return ts.factory.updatePropertyAssignment(
      node,
      parseTsClassArguments(node.name, options) as ts.PropertyName,
      node.initializer,
    );
  } else if (ts.isComputedPropertyName(node)) {
    return ts.factory.updateComputedPropertyName(
      node,
      parseTsClassArguments(node.expression, options) as ts.Expression,
    );
  } else if (ts.isPropertyAccessExpression(node)) {
    return ts.factory.updatePropertyAccessExpression(
      node,
      node.expression,
      ts.factory.createIdentifier(prefixer(node.name.text, options)),
    );
  } else if (ts.isTemplateLiteral(node) || ts.isStringLiteral(node)) {
    if (
      (ts.isStringLiteral(node) && node.text.search(selectorRegex) !== -1) ||
      (ts.isTemplateExpression(node) &&
        node.head.text.search(selectorRegex) !== -1) ||
      (ts.isNoSubstitutionTemplateLiteral(node) &&
        node.text.search(selectorRegex) !== -1)
    ) {
      throw new Error(
        'It seems you passed a css selector in the "classPrefixer" function argument. This function only accepts plain class names. Consider using the "selectorPrefixer" if you need to prefix css selectors',
      );
    }

    return updateTsLiterals(node, prefixer, options);
  }

  return node;
}
