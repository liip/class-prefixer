import { Prefixer } from '@liip/class-prefixer-core';

import { updateLiterals } from '../update-literals';

import type { Literal, TemplateLiteral } from 'estree';

const prefixer = jest.fn();

describe('parseSelectorArguments', () => {
  const prefix = {
    value: 'prefix-',
    excludes: ['excluded', /^reg-exclude/],
  };

  beforeEach(() => {
    prefixer.mockReset();
  });

  it('should parse and handle a simple literal node', () => {
    const originalNode: Literal = {
      type: 'Literal',
      value: 'value',
      raw: "'value'",
    };

    const options = { prefix };

    updateLiterals({
      node: originalNode,
      prefixer: prefixer as Prefixer,
      options,
    });

    expect(prefixer).toHaveBeenCalledWith(originalNode.value, options);
  });

  it('should parse and handle a template literal node', () => {
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

    const options = { prefix };

    updateLiterals({
      node: originalNode,
      prefixer: prefixer as Prefixer,
      options,
    });

    expect(prefixer).toHaveBeenNthCalledWith(
      1,
      originalNode.quasis[0].value.raw,
      options,
    );
    expect(prefixer).toHaveBeenNthCalledWith(
      2,
      originalNode.quasis[1].value.raw,
      options,
    );
  });
});
