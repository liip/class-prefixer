import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { rollup } from 'rollup';

import astTransform, { PluginAstTransformOptions } from '../plugin';

describe('astTransform Plugin', () => {
  const placeholder = 'astParser';
  const argument = 'ast-plugin';
  const virtualPackage = 'ast-plugin';

  let tmpDir: string;
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
    });

    it('should transform using the provided visitors', async () => {
      const testCase = `export default function testCase() { return ${placeholder}('${argument}') }`;
      await writeFile(testFile, testCase);

      const options: PluginAstTransformOptions = {
        visitors: [
          {
            enter(node) {
              if (
                node.type === 'CallExpression' &&
                node.callee.type === 'Identifier' &&
                node.callee.name === placeholder
              ) {
                return {
                  type: 'Literal',
                  value: argument,
                  raw: `"${argument}"`,
                };
              }

              return node;
            },
          },
        ],
      };

      const bundle = await rollup({
        input: entryPoint,
        plugins: [astTransform(options)],
        treeshake: false,
      });

      const { output } = await bundle.generate({ format: 'es' });

      expect(output[0].code).toContain(argument); // Check the transformed source code
      expect(output[0].code).not.toContain(placeholder); // Ensure placeholder is replaced
    });
  });
});
