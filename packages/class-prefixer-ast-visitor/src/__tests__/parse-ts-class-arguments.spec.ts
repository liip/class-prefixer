import * as ts from 'typescript';

import { parseTsClassArguments } from '../parse-ts-class-arguments';

describe('parseTsClassArguments', () => {
  const prefix = { value: 'prefix-', excludes: ['excluded', /^reg-exclude/] };

  it('should update StringLiteral node', () => {
    const originalNode: ts.StringLiteral = {
      kind: ts.SyntaxKind.StringLiteral,
      text: 'value second-value',
    } as unknown as ts.StringLiteral;

    const expectedNode: ts.StringLiteral = {
      kind: ts.SyntaxKind.StringLiteral,
      text: `${prefix.value}value ${prefix.value}second-value`,
    } as unknown as ts.StringLiteral;

    const result = parseTsClassArguments(originalNode, { prefix });

    expect(result).toMatchObject(expectedNode);
  });

  it('should update TemplateExpression node', () => {
    const originalNode: ts.TemplateExpression = {
      kind: ts.SyntaxKind.TemplateExpression,
      head: {
        kind: ts.SyntaxKind.TemplateHead,
        text: 'value value--',
      },
      templateSpans: [],
    } as unknown as ts.TemplateExpression;

    const expectedNode: ts.TemplateExpression = {
      kind: ts.SyntaxKind.TemplateExpression,
      head: {
        kind: ts.SyntaxKind.TemplateHead,
        text: `${prefix.value}value ${prefix.value}value--`,
      },
    } as unknown as ts.TemplateExpression;

    const result = parseTsClassArguments(originalNode, { prefix });

    expect(result).toMatchObject(expectedNode);
  });

  it('should honor excludes values', () => {
    const originalNode: ts.StringLiteral = {
      kind: ts.SyntaxKind.StringLiteral,
      text: 'value excluded reg-exclude value-reg-exclude',
    } as unknown as ts.StringLiteral;

    const expectedNode: ts.StringLiteral = {
      kind: ts.SyntaxKind.StringLiteral,
      text: `${prefix.value}value excluded reg-exclude ${prefix.value}value-reg-exclude`,
    } as unknown as ts.StringLiteral;

    const result = parseTsClassArguments(originalNode, { prefix });

    expect(result).toMatchObject(expectedNode);
  });

  it('should throw if value is a css selector', () => {
    const originalNode: ts.StringLiteral = {
      kind: ts.SyntaxKind.StringLiteral,
      text: '.value .second-value',
    } as unknown as ts.StringLiteral;

    expect(() => parseTsClassArguments(originalNode, { prefix })).toThrow();
  });

  it('should traverse ObjectLiteralExpression and update its property name StringLiteral nodes', () => {
    const originalNode: ts.ObjectLiteralExpression = {
      kind: ts.SyntaxKind.ObjectLiteralExpression,
      properties: [
        {
          kind: ts.SyntaxKind.PropertyAssignment,
          name: {
            kind: ts.SyntaxKind.StringLiteral,
            text: 'value',
          },
          initializer: {
            kind: ts.SyntaxKind.PropertyAccessExpression,
            expression: {
              kind: ts.SyntaxKind.ThisKeyword,
            },
            name: {
              kind: ts.SyntaxKind.Identifier,
              text: 'actionable',
            },
          },
        },
      ],
    } as unknown as ts.ObjectLiteralExpression;

    const expectedNode: ts.ObjectLiteralExpression = {
      kind: ts.SyntaxKind.ObjectLiteralExpression,
      properties: [
        {
          kind: ts.SyntaxKind.PropertyAssignment,
          name: {
            kind: ts.SyntaxKind.StringLiteral,
            text: `${prefix.value}value`,
          },
          initializer: {
            kind: ts.SyntaxKind.PropertyAccessExpression,
            expression: {
              kind: ts.SyntaxKind.ThisKeyword,
            },
            name: {
              kind: ts.SyntaxKind.Identifier,
              text: 'actionable',
            },
          },
        },
      ],
    } as unknown as ts.ObjectLiteralExpression;

    const result = parseTsClassArguments(originalNode, {
      prefix,
    }) as ts.ObjectLiteralExpression;

    expect(result.properties[0]).toMatchObject(expectedNode.properties[0]);
  });

  it('should traverse ArrayLiteralExpression node and update required value', () => {
    const originalNode: ts.ArrayLiteralExpression = {
      kind: ts.SyntaxKind.ArrayLiteralExpression,
      elements: [
        {
          kind: ts.SyntaxKind.StringLiteral,
          text: 'value second-value',
        },
        {
          kind: ts.SyntaxKind.ObjectLiteralExpression,
          properties: [
            {
              kind: ts.SyntaxKind.PropertyAssignment,
              name: {
                kind: ts.SyntaxKind.StringLiteral,
                text: 'third-value',
              },
              initializer: {
                kind: ts.SyntaxKind.PropertyAccessExpression,
                expression: {
                  kind: ts.SyntaxKind.ThisKeyword,
                },
                name: {
                  kind: ts.SyntaxKind.Identifier,
                  text: 'actionable',
                },
              },
            },
          ],
        },
        {
          kind: ts.SyntaxKind.PropertyAccessExpression,
          expression: {
            kind: ts.SyntaxKind.ThisKeyword,
          },
          name: {
            kind: ts.SyntaxKind.Identifier,
            text: 'rootClass',
          },
        },
      ],
    } as unknown as ts.ArrayLiteralExpression;

    const expectedNode: ts.ArrayLiteralExpression = {
      kind: ts.SyntaxKind.ArrayLiteralExpression,
      elements: [
        {
          kind: ts.SyntaxKind.StringLiteral,
          text: `${prefix.value}value ${prefix.value}second-value`,
        },
        {
          kind: ts.SyntaxKind.ObjectLiteralExpression,
          properties: [
            {
              kind: ts.SyntaxKind.PropertyAssignment,
              name: {
                kind: ts.SyntaxKind.StringLiteral,
                text: `${prefix.value}third-value`,
              },
              initializer: {
                kind: ts.SyntaxKind.PropertyAccessExpression,
                expression: {
                  kind: ts.SyntaxKind.ThisKeyword,
                },
                name: {
                  kind: ts.SyntaxKind.Identifier,
                  text: 'actionable',
                },
              },
            },
          ],
        },
        {
          kind: ts.SyntaxKind.PropertyAccessExpression,
          expression: {
            kind: ts.SyntaxKind.ThisKeyword,
          },
          name: {
            kind: ts.SyntaxKind.Identifier,
            text: 'rootClass',
          },
        },
      ],
    } as unknown as ts.ArrayLiteralExpression;

    const result = parseTsClassArguments(originalNode, {
      prefix,
    }) as ts.ArrayLiteralExpression;

    for (let i = 0; i < result.elements.length; i++) {
      const resultElement = result.elements[i];
      const expectedElement = expectedNode.elements[i];

      if (ts.isStringLiteral(resultElement)) {
        expect(resultElement).toMatchObject(expectedElement);
      } else if (ts.isObjectLiteralExpression(resultElement)) {
        expect(resultElement.properties[0]).toMatchObject(
          (expectedElement as ts.ObjectLiteralExpression).properties[0],
        );
      }
    }
  });

  it('should handle CallExpression node and update required value', () => {
    const originalNode: ts.CallExpression = {
      kind: ts.SyntaxKind.CallExpression,
      expression: {
        kind: ts.SyntaxKind.Identifier,
        text: 'calleeName',
      },
      arguments: [
        {
          kind: ts.SyntaxKind.ArrayLiteralExpression,
          elements: [
            {
              kind: ts.SyntaxKind.StringLiteral,
              text: 'value second-value',
            },
            {
              kind: ts.SyntaxKind.ObjectLiteralExpression,
              properties: [
                {
                  kind: ts.SyntaxKind.PropertyAssignment,
                  name: {
                    kind: ts.SyntaxKind.StringLiteral,
                    text: 'third-value',
                  },
                  initializer: {
                    kind: ts.SyntaxKind.PropertyAccessExpression,
                    expression: {
                      kind: ts.SyntaxKind.ThisKeyword,
                    },
                    name: {
                      kind: ts.SyntaxKind.Identifier,
                      text: 'actionable',
                    },
                  },
                },
              ],
            },
            {
              kind: ts.SyntaxKind.PropertyAccessExpression,
              expression: {
                kind: ts.SyntaxKind.ThisKeyword,
              },
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'rootClass',
              },
            },
          ],
        },
      ],
    } as unknown as ts.CallExpression;

    const expectedNode: ts.CallExpression = {
      kind: ts.SyntaxKind.CallExpression,
      expression: {
        kind: ts.SyntaxKind.Identifier,
        text: 'calleeName',
      },
      arguments: [
        {
          kind: ts.SyntaxKind.ArrayLiteralExpression,
          elements: [
            {
              kind: ts.SyntaxKind.StringLiteral,
              text: `${prefix.value}value ${prefix.value}second-value`,
            },
            {
              kind: ts.SyntaxKind.ObjectLiteralExpression,
              properties: [
                {
                  kind: ts.SyntaxKind.PropertyAssignment,
                  name: {
                    kind: ts.SyntaxKind.StringLiteral,
                    text: `${prefix.value}third-value`,
                  },
                  initializer: {
                    kind: ts.SyntaxKind.PropertyAccessExpression,
                    expression: {
                      kind: ts.SyntaxKind.ThisKeyword,
                    },
                    name: {
                      kind: ts.SyntaxKind.Identifier,
                      text: 'actionable',
                    },
                  },
                },
              ],
            },
            {
              kind: ts.SyntaxKind.PropertyAccessExpression,
              expression: {
                kind: ts.SyntaxKind.ThisKeyword,
              },
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'rootClass',
              },
            },
          ],
        },
      ],
    } as unknown as ts.CallExpression;

    const result = parseTsClassArguments(originalNode, {
      prefix,
    }) as ts.CallExpression;

    for (let i = 0; i < result.arguments.length; i++) {
      const resultArgument = result.arguments[i];
      const expectedArgument = expectedNode.arguments[i];

      if (ts.isArrayLiteralExpression(resultArgument)) {
        for (let j = 0; j < resultArgument.elements.length; j++) {
          const resultElement = resultArgument.elements[j];
          const expectedElement = (
            expectedArgument as ts.ArrayLiteralExpression
          ).elements[j];

          if (ts.isStringLiteral(resultElement)) {
            expect(resultElement).toMatchObject(expectedElement);
          } else if (ts.isObjectLiteralExpression(resultElement)) {
            expect(resultElement.properties[0]).toMatchObject(
              (expectedElement as ts.ObjectLiteralExpression).properties[0],
            );
          }
        }
      } else if (ts.isObjectLiteralExpression(resultArgument)) {
        expect(resultArgument.properties[0]).toMatchObject(
          (expectedArgument as ts.ObjectLiteralExpression).properties[0],
        );
      }
    }
  });

  it('should handle complex array with computed property', () => {
    const originalNode: ts.ArrayLiteralExpression = {
      kind: ts.SyntaxKind.ArrayLiteralExpression,
      elements: [
        {
          kind: ts.SyntaxKind.StringLiteral,
          text: 'value',
        },
        {
          kind: ts.SyntaxKind.ObjectLiteralExpression,
          properties: [
            {
              kind: ts.SyntaxKind.PropertyAssignment,
              name: {
                kind: ts.SyntaxKind.StringLiteral,
                text: 'second-value',
              },
              initializer: {
                kind: ts.SyntaxKind.TrueKeyword,
              },
            },
            {
              kind: ts.SyntaxKind.ComputedPropertyName,
              expression: {
                kind: ts.SyntaxKind.TemplateExpression,
                head: {
                  kind: ts.SyntaxKind.TemplateHead,
                  text: 'third-',
                },
                templateSpans: [
                  {
                    kind: ts.SyntaxKind.TemplateSpan,
                    expression: {
                      kind: ts.SyntaxKind.Identifier,
                      text: 'value',
                    },
                    literal: {
                      kind: ts.SyntaxKind.TemplateTail,
                      text: '',
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          kind: ts.SyntaxKind.StringLiteral,
          text: 'fourth value',
        },
      ],
    } as unknown as ts.ArrayLiteralExpression;

    const expectedNode: ts.ArrayLiteralExpression = {
      kind: ts.SyntaxKind.ArrayLiteralExpression,
      elements: [
        {
          kind: ts.SyntaxKind.StringLiteral,
          text: `${prefix.value}value`,
        },
        {
          kind: ts.SyntaxKind.ObjectLiteralExpression,
          properties: [
            {
              kind: ts.SyntaxKind.PropertyAssignment,
              name: {
                kind: ts.SyntaxKind.StringLiteral,
                text: `${prefix.value}second-value`,
              },
              initializer: {
                kind: ts.SyntaxKind.TrueKeyword,
              },
            },
            {
              kind: ts.SyntaxKind.ComputedPropertyName,
              expression: {
                kind: ts.SyntaxKind.TemplateExpression,
                head: {
                  kind: ts.SyntaxKind.TemplateHead,
                  text: `${prefix.value}third-`,
                },
                templateSpans: [
                  {
                    kind: ts.SyntaxKind.TemplateSpan,
                    expression: {
                      kind: ts.SyntaxKind.Identifier,
                      text: 'value',
                    },
                    literal: {
                      kind: ts.SyntaxKind.TemplateTail,
                      text: '',
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          kind: ts.SyntaxKind.StringLiteral,
          text: `${prefix.value}fourth ${prefix.value}value`,
        },
      ],
    } as unknown as ts.ArrayLiteralExpression;

    const result = parseTsClassArguments(originalNode, {
      prefix,
    }) as ts.ArrayLiteralExpression;

    for (let i = 0; i < result.elements.length; i++) {
      const resultElement = result.elements[i];
      const expectedElement = expectedNode.elements[i];

      if (ts.isStringLiteral(resultElement)) {
        expect(resultElement).toMatchObject(expectedElement);
      } else if (ts.isObjectLiteralExpression(resultElement)) {
        for (let j = 0; j < resultElement.properties.length; j++) {
          const resultProperty = resultElement.properties[j];
          const expectedProperty = (
            expectedElement as ts.ObjectLiteralExpression
          ).properties[j];

          if (ts.isPropertyAssignment(resultProperty)) {
            expect(resultProperty).toMatchObject(expectedProperty);
          }

          if (ts.isComputedPropertyName(resultProperty)) {
            expect(
              (
                (resultProperty as ts.ComputedPropertyName)
                  .expression as ts.TemplateExpression
              ).head.text,
            ).toBe(
              (
                (expectedProperty as unknown as ts.ComputedPropertyName)
                  .expression as ts.TemplateExpression
              ).head.text,
            );
          }
        }
      }
    }
  });
});
