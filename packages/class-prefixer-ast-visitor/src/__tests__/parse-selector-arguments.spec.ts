import { parseSelectorArguments } from '../parse-selector-arguments';

import type { Literal, ObjectExpression } from 'estree';

describe('parseSelectorArguments', () => {
  const prefix = {
    value: 'prefix-',
    excludes: ['excluded', /^reg-exclude/],
  };

  it('should parse and prefix a simple class selector', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: '.value',
      raw: "'.value'",
    };

    const expectedNode: Literal = {
      type: 'Literal',
      value: `.${prefix.value}value`,
      raw: `'.${prefix.value}value'`,
    };

    const result = parseSelectorArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });

  it('should parse and prefix a compound class selector', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: '.value .second.value, .third-value',
      raw: "'.value .second.value, .third-value'",
    };

    const expectedNode: Literal = {
      type: 'Literal',
      value: `.${prefix.value}value .${prefix.value}second.${prefix.value}value, .${prefix.value}third-value`,
      raw: `'.${prefix.value}value .${prefix.value}second.${prefix.value}value, .${prefix.value}third-value'`,
    };

    const result = parseSelectorArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });

  it('should not prefix non class selector', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: '#value, [data-value]',
      raw: "'#value, [data-value]'",
    };

    const result = parseSelectorArguments(originalNode, { prefix });

    expect(result).toEqual(originalNode);
  });

  it('should honors excludes', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: '.value .reg-exclude, .excluded.value-reg-exclude',
      raw: '.value .reg-exclude, .excluded.value-reg-exclude',
    };

    const expectedNode: Literal = {
      type: 'Literal',
      value: `.${prefix.value}value .reg-exclude, .excluded.${prefix.value}value-reg-exclude`,
      raw: `'.${prefix.value}value .reg-exclude, .excluded.${prefix.value}value-reg-exclude'`,
    };

    const result = parseSelectorArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });

  it('should throw if value is not a string literal', () => {
    const originalNode: ObjectExpression = {
      type: 'ObjectExpression',
      properties: [
        {
          type: 'Property',
          key: {
            type: 'Literal',
            value: 'value',
            raw: "'value'",
          },
          value: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: {
              type: 'Identifier',
              name: 'actionable',
            },
            computed: false,
            optional: false,
          },
          kind: 'init',
          method: false,
          shorthand: false,
          computed: false,
        },
      ],
    };

    expect(() => parseSelectorArguments(originalNode, { prefix })).toThrow();
  });
});
