import * as ts from 'typescript';

import { isFunction } from './utils';

type TsParserOptions = {
  path: string;
  source: string;
  tsConfig: ts.ParsedCommandLine;
  transformers?:
    | ts.TransformerFactory<ts.Node>[]
    | ts.TransformerFactory<ts.Node>;
};

/**
 * Create an AST representation of the provided source and use the
 * visitor object to transform it if provided
 */
export function tsParser({
  path,
  source,
  tsConfig,
  transformers,
}: TsParserOptions) {
  if (!transformers) {
    /* eslint-disable-next-line no-console */
    console.warn(
      '[esbuildPluginAst]: No typescript visitor provided, the plugin will have no effect.',
    );
    return source;
  }

  const compilerOptions = tsConfig.options;
  const sourceFile = ts.createSourceFile(
    path,
    source,
    compilerOptions.target || ts.ScriptTarget.Latest,
    true,
  );

  const transformersArray = Array.isArray(transformers)
    ? transformers
    : [transformers];

  const factories: ts.TransformerFactory<ts.Node>[] = [];

  for (const visitor of transformersArray) {
    if (!isFunction(visitor)) {
      throw new Error(
        `[esbuildPluginAst]: The provided visitor is not a function. You provided ${typeof visitor}`,
      );
    }

    factories.push(visitor);
  }

  // Apply the transformation
  const result = ts.transform(sourceFile, factories);

  const transformedSourceFile = result.transformed[0].getSourceFile();

  // Print the transformed TypeScript code
  const printer = ts.createPrinter();
  return printer.printFile(transformedSourceFile);
}
