import * as ts from 'typescript';

import { tsParser } from '../ts-parser';

const createTransformer =
  (visitor: ts.Visitor) =>
  (context: ts.TransformationContext) =>
  (rootNode: ts.Node) => {
    const visit = (node: ts.Node) =>
      visitor(ts.visitEachChild(node, visit, context)) || node;

    return ts.visitNode(rootNode, visit);
  };

describe('tsParser', () => {
  const source = 'const value = 1;';
  const path = 'test.ts';
  const tsConfig: ts.ParsedCommandLine = {
    options: { target: ts.ScriptTarget.Latest },
    fileNames: [],
    errors: [],
  };

  it('should return the source if no valid visitor is provided', () => {
    expect(tsParser({ path, source, tsConfig })).toContain(source);
  });

  it('should transform the source if visitor is a valid visitor function', () => {
    const transformers = createTransformer((node) => {
      if (ts.isNumericLiteral(node)) {
        return ts.factory.createNumericLiteral('2');
      }

      return node;
    });

    expect(
      tsParser({
        path,
        source,
        tsConfig,
        transformers,
      }).trim(),
    ).toEqual('const value = 2;');
  });

  it('should transform the source if multiple transformers are passed', () => {
    const transformers = [
      createTransformer((node) => {
        if (ts.isNumericLiteral(node)) {
          return ts.factory.createNumericLiteral('2');
        }
        return node;
      }),
      createTransformer((node) => {
        if (ts.isIdentifier(node) && node.text === 'value') {
          return ts.factory.createIdentifier('expected');
        }
        return node;
      }),
    ];

    expect(tsParser({ path, source, tsConfig, transformers }).trim()).toMatch(
      'const expected = 2;',
    );
  });
});
