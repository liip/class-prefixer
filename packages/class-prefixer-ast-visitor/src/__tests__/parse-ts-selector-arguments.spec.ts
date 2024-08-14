import * as ts from 'typescript';

import { parseTsSelectorArguments } from '../parse-ts-selector-arguments';

describe('parseTsSelectorArguments', () => {
  const prefix = {
    value: 'prefix-',
    excludes: ['excluded', /^reg-exclude/],
  };

  it('should parse and prefix a simple class selector', () => {
    const originalNode = ts.factory.createStringLiteral('.value');

    const result = parseTsSelectorArguments(originalNode, { prefix });

    expect(ts.isStringLiteral(result)).toBe(true);
    expect((result as ts.StringLiteral).text).toBe('.prefix-value');
  });

  it('should parse and prefix a compound class selector', () => {
    const originalNode = ts.factory.createStringLiteral(
      '.value .second.value, .third-value',
    );

    const result = parseTsSelectorArguments(originalNode, { prefix });

    expect(ts.isStringLiteral(result)).toBe(true);
    expect((result as ts.StringLiteral).text).toBe(
      '.prefix-value .prefix-second.prefix-value, .prefix-third-value',
    );
  });

  it('should not prefix non class selector', () => {
    const originalNode = ts.factory.createStringLiteral('#value, [data-value]');

    const result = parseTsSelectorArguments(originalNode, { prefix });

    expect(ts.isStringLiteral(result)).toBe(true);
    expect((result as ts.StringLiteral).text).toBe('#value, [data-value]');
  });

  it('should honor excludes', () => {
    const originalNode = ts.factory.createStringLiteral(
      '.value .reg-exclude, .excluded.value-reg-exclude',
    );

    const result = parseTsSelectorArguments(originalNode, { prefix });

    expect(ts.isStringLiteral(result)).toBe(true);
    expect((result as ts.StringLiteral).text).toBe(
      '.prefix-value .reg-exclude, .excluded.prefix-value-reg-exclude',
    );
  });

  it('should handle template literals', () => {
    const originalNode = ts.factory.createNoSubstitutionTemplateLiteral(
      '.value ${dynamicClass}',
    );

    const result = parseTsSelectorArguments(originalNode, { prefix });

    expect(ts.isNoSubstitutionTemplateLiteral(result)).toBe(true);
    expect((result as ts.NoSubstitutionTemplateLiteral).text).toBe(
      '.prefix-value ${dynamicClass}',
    );
  });

  it('should throw if value is not a string literal or template literal', () => {
    const originalNode = ts.factory.createNumericLiteral(42);

    expect(() => parseTsSelectorArguments(originalNode, { prefix })).toThrow();
  });
});
