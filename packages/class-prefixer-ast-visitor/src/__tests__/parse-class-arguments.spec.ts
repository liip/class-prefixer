import { parseClassArguments } from '../parse-class-arguments';

import type {
  Literal,
  TemplateLiteral,
  ObjectExpression,
  ArrayExpression,
} from 'estree';

describe('parseClassArguments', () => {
  const prefix = { value: 'prefix-', excludes: ['excluded', /^reg-exclude/] };

  it('should update Literal node', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: 'value second-value',
      raw: "'value second-value'",
    };

    const expectedNode: Literal = {
      type: 'Literal',
      value: `${prefix.value}value ${prefix.value}second-value`,
      raw: `'${prefix.value}value ${prefix.value}second-value'`,
    };

    const result = parseClassArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });

  it('should update TemplateLiteral node', () => {
    const originalNode: TemplateLiteral = {
      type: 'TemplateLiteral',
      expressions: [],
      quasis: [
        {
          type: 'TemplateElement',
          tail: false,
          value: { raw: 'value value--', cooked: 'value value--' },
        },
        {
          type: 'TemplateElement',
          tail: true,
          value: { raw: '', cooked: '' },
        },
      ],
    };

    const expectedNode: TemplateLiteral = {
      type: 'TemplateLiteral',
      expressions: [],
      quasis: [
        {
          type: 'TemplateElement',
          tail: false,
          value: {
            raw: `${prefix.value}value ${prefix.value}value--`,
            cooked: 'value value--',
          },
        },
        {
          type: 'TemplateElement',
          tail: true,
          value: { raw: '', cooked: '' },
        },
      ],
    };

    const result = parseClassArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });

  it('should honors excludes values', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: 'value excluded reg-exclude value-reg-exclude',
      raw: "'value excluded reg-exclude value-reg-exclude'",
    };

    const expectedNode: Literal = {
      type: 'Literal',
      value: `${prefix.value}value excluded reg-exclude ${prefix.value}value-reg-exclude`,
      raw: `'${prefix.value}value excluded reg-exclude ${prefix.value}value-reg-exclude'`,
    };

    const result = parseClassArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });

  it('should throw if value is a css selector', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: '.value .second-value',
      raw: "'.value .second-value'",
    };

    expect(() => parseClassArguments(originalNode, { prefix })).toThrow();
  });

  it('should traverse ObjectExpression Node and update its key Literal nodes', () => {
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

    const expectedNode: ObjectExpression = {
      type: 'ObjectExpression',
      properties: [
        {
          type: 'Property',
          key: {
            type: 'Literal',
            value: `${prefix.value}value`,
            raw: `'${prefix.value}value'`,
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

    const result = parseClassArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });

  it('should traverse ArrayExpression node and update required value', () => {
    const originalNode: ArrayExpression = {
      type: 'ArrayExpression',
      elements: [
        {
          type: 'Literal',
          value: 'value second-value',
          raw: "'value second-value'",
        },
        {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: {
                type: 'Literal',
                value: 'third-value',
                raw: "'third-value'",
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
        },
        {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: {
            type: 'Identifier',
            name: 'rootClass',
          },
          computed: false,
          optional: false,
        },
      ],
    };

    const expectedNode: ArrayExpression = {
      type: 'ArrayExpression',
      elements: [
        {
          type: 'Literal',
          value: `${prefix.value}value ${prefix.value}second-value`,
          raw: `'${prefix.value}value ${prefix.value}second-value'`,
        },
        {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: {
                type: 'Literal',
                value: `${prefix.value}third-value`,
                raw: `'${prefix.value}third-value'`,
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
        },
        {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: {
            type: 'Identifier',
            name: 'rootClass',
          },
          computed: false,
          optional: false,
        },
      ],
    };

    const result = parseClassArguments(originalNode, { prefix });

    expect(result).toEqual(expectedNode);
  });
});
