import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { context, BuildContext, BuildOptions, OutputFile } from 'esbuild';

import { astParserVue, AstParserVueOptions } from '../plugin';

describe('astPluginVue', () => {
  const placeholder = 'astPluginVue';
  const argument = 'ast-plugin-vue';
  const virtualPackage = 'ast-plugin-vue';

  const pluginOptions: AstParserVueOptions = {
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
    templateVisitor: {
      enter(node) {
        if (
          node.type === 'Property' &&
          node.key.type === 'Identifier' &&
          node.key.name === 'class'
        ) {
          return {
            ...node,
            value: {
              ...node.value,
              value: argument,
              raw: `'${argument}'`,
            },
          };
        }
      },
    },
  };

  const esbuildConfig: BuildOptions = {
    bundle: true,
    format: 'esm',
    minify: false,
    write: false,
    external: ['vue'],
    plugins: [astParserVue(pluginOptions)],
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

    entryPoint = join(tmpDir, `/packages/${virtualPackage}/index.js`);
    testFilePath = `./packages/${virtualPackage}/test-case.vue`;
    testFile = join(tmpDir, testFilePath);
  });

  beforeEach(async () => {
    await writeFile(
      entryPoint,
      `import testCase from './test-case.vue';\ntestCase();`,
    );

    ctx = await context({
      ...esbuildConfig,
      entryPoints: { index: entryPoint },
      minify: true,
    });
  });

  afterEach(async () => {
    await ctx.dispose();
    await rm(testFile);
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('Script section', () => {
    it('should correctly handle Vue dependencies containing astPlugin placeholder', async () => {
      const testCase = `<script>export default { computed: { className() { return ${placeholder}('${argument}')}} }</script>`;
      await writeFile(testFile, testCase);

      const result = await ctx.rebuild();

      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.stringContaining(argument),
      );
      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.not.stringContaining(placeholder),
      );
    });

    it('should correctly handle Vue dependencies containing astPlugin placeholder in script setup', async () => {
      const testCase = `<script setup>import { ref } from 'vue'; const arg = ref(${placeholder}('${argument}'));</script>`;
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

  describe('Template section', () => {
    it('should correctly handle Vue dependencies with static class in the template', async () => {
      const testCase = `<template><div class="${placeholder}(${argument})"></div></template><script>export default {}</script>`;
      await writeFile(testFile, testCase);

      const result = await ctx.rebuild();

      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.stringContaining(`class:"${argument}"`),
      );
      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.not.stringContaining(placeholder),
      );
    });
  });
});
