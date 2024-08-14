import { Prefixer } from '@liip/class-prefixer-core';
import * as ts from 'typescript';

import { updateTsLiterals } from '../update-ts-literals';

const prefixer = jest.fn();

describe('updateTsLiterals', () => {
  const prefix = {
    value: 'prefix-',
    excludes: ['excluded', /^reg-exclude/],
  };

  beforeEach(() => {
    prefixer.mockReset();
    prefixer.mockImplementation((value) => `${prefix.value}${value}`);
  });

  it('should parse and handle a simple string literal node', () => {
    const originalNode = ts.factory.createStringLiteral('value');

    const options = { prefix };

    const result = updateTsLiterals(
      originalNode,
      prefixer as Prefixer,
      options,
    );

    expect(prefixer).toHaveBeenCalledWith('value', options);
    expect(ts.isStringLiteral(result)).toBeTruthy();
    expect((result as ts.StringLiteral).text).toBe(
      prefixer.mock.results[0].value,
    );
  });

  it('should parse and handle a no substitution template literal node', () => {
    const originalNode = ts.factory.createNoSubstitutionTemplateLiteral(
      'value value--',
      'value value--',
    );

    const options = { prefix };

    const result = updateTsLiterals(
      originalNode,
      prefixer as Prefixer,
      options,
    );

    expect(prefixer).toHaveBeenCalledWith('value value--', options);
    expect(ts.isNoSubstitutionTemplateLiteral(result)).toBeTruthy();
    expect((result as ts.NoSubstitutionTemplateLiteral).text).toBe(
      prefixer.mock.results[0].value,
    );
  });

  it('should parse and handle a template expression node', () => {
    const originalNode = ts.factory.createTemplateExpression(
      ts.factory.createTemplateHead('value '),
      [
        ts.factory.createTemplateSpan(
          ts.factory.createIdentifier('expr'),
          ts.factory.createTemplateTail(' value--'),
        ),
      ],
    );

    const options = { prefix };

    const result = updateTsLiterals(
      originalNode,
      prefixer as Prefixer,
      options,
    );

    expect(prefixer).toHaveBeenCalledTimes(1);
    expect(prefixer).toHaveBeenCalledWith('value ', options);
    expect(ts.isTemplateExpression(result)).toBeTruthy();
    expect((result as ts.TemplateExpression).head.text).toBe(
      prefixer.mock.results[0].value,
    );
  });
});
