import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { context, BuildContext, BuildOptions, OutputFile } from 'esbuild';
import * as ts from 'typescript';

import { esbuildAstParser, EsbuildAstParserOptions } from '../plugin';

describe('astParser', () => {
  const placeholder = 'astParser';
  const argument = 'ast-plugin';
  const virtualPackage = 'ast-plugin';

  const createTsTransformer =
    (visitor: ts.Visitor) =>
    (context: ts.TransformationContext) =>
    (rootNode: ts.Node) => {
      const visit = (node: ts.Node) =>
        visitor(ts.visitEachChild(node, visit, context)) || node;

      return ts.visitNode(rootNode, visit);
    };

  const pluginOptions: EsbuildAstParserOptions = {
    visitors: {
      enter(node) {
        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'Identifier' &&
          node.callee.name === placeholder
        ) {
          return node.arguments[0];
        }
        return node;
      },
    },

    tsTransformers: createTsTransformer((node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === placeholder
      ) {
        if (
          node.arguments.length > 0 &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          return ts.factory.createStringLiteral(node.arguments[0].text);
        }
        return node;
      }
      return node;
    }),
  };

  const esbuildConfig: BuildOptions = {
    bundle: true,
    format: 'esm',
    minify: false,
    write: false,
    loader: { '.json': 'json' },
    plugins: [esbuildAstParser(pluginOptions)],
  };

  let tmpDir: string;
  let ctx: BuildContext;
  let testFile: string;
  let testFilePath: string;
  let entryPoint: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'esbuild-plugin-ast'));

    await mkdir(join(tmpDir, 'packages', virtualPackage), {
      recursive: true,
    });
  });

  afterEach(async () => {
    await ctx.dispose();
    await rm(testFile);
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('JavaScript files', () => {
    beforeAll(() => {
      entryPoint = join(tmpDir, `/packages/${virtualPackage}/index.js`);
      testFilePath = `./packages/${virtualPackage}/test-case.js`;
      testFile = join(tmpDir, testFilePath);
    });

    beforeEach(async () => {
      await writeFile(
        entryPoint,
        `import testCase from './test-case.js';\ntestCase();`,
      );

      ctx = await context({
        ...esbuildConfig,
        entryPoints: { index: entryPoint },
      });
    });

    it('should parse and transform JavaScript dependencies', async () => {
      const testCase = `export default function testCase() { return ${placeholder}('${argument}') }`;
      await writeFile(testFile, testCase);

      const result = await ctx.rebuild();

      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.stringContaining(argument),
      );
      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.not.stringContaining(placeholder),
      );
    });
  });

  describe('TypeScript files', () => {
    beforeAll(() => {
      entryPoint = join(tmpDir, `/packages/${virtualPackage}/index.ts`);
      testFilePath = `./packages/${virtualPackage}/test-case.ts`;
      testFile = join(tmpDir, testFilePath);
    });

    beforeEach(async () => {
      await writeFile(
        entryPoint,
        `import testCase from './test-case';\ntestCase();`,
      );

      ctx = await context({
        ...esbuildConfig,
        entryPoints: { index: entryPoint },
      });
    });

    it('should parse and transform TypeScript dependencies', async () => {
      const testCase = `export default function testCase(): string { return ${placeholder}('${argument}') }`;
      await writeFile(testFile, testCase);

      const result = await ctx.rebuild();

      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.stringContaining(argument),
      );
      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.not.stringContaining(placeholder),
      );
    });
  });

  describe('Other file types', () => {
    beforeAll(() => {
      entryPoint = join(tmpDir, `/packages/${virtualPackage}/index.js`);
      testFilePath = `./packages/${virtualPackage}/test-case.json`;
      testFile = join(tmpDir, testFilePath);
    });

    beforeEach(async () => {
      await writeFile(
        entryPoint,
        `import testCase from './test-case.json';\ntestCase.${argument};`,
      );

      ctx = await context({
        ...esbuildConfig,
        entryPoints: { index: entryPoint },
      });
    });

    it('should not parse and transform file types explicitly handled by other loaders', async () => {
      const testCase = `{ "${argument}": "value" }`;
      await writeFile(testFile, testCase);

      const result = await ctx.rebuild();

      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.stringContaining('value'),
      );
    });
  });
});
