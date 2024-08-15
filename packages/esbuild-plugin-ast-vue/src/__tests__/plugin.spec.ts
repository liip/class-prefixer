import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  esbuildAstParser,
  EsbuildAstParserOptions,
} from '@liip/esbuild-plugin-ast';
import { context, BuildContext, BuildOptions, OutputFile } from 'esbuild';

import { esbuildAstParserVue, EsbuildAstParserVueOptions } from '../plugin';

describe('astPluginVue', () => {
  const placeholder = 'astPluginVue';
  const argument = 'ast-plugin-vue';
  const virtualPackage = 'ast-plugin-vue';
  const namespace = 'ast-parser-vue';

  const visitors: EsbuildAstParserOptions['visitors'] = {
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
  };

  const vuePluginOptions: EsbuildAstParserVueOptions = {
    visitors,
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
  });

  afterEach(async () => {
    await ctx.dispose();
    await rm(testFile);
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('Standalone usage', () => {
    beforeEach(async () => {
      ctx = await context({
        ...esbuildConfig,
        plugins: [esbuildAstParserVue(vuePluginOptions)],
        entryPoints: { index: entryPoint },
        minify: true,
      });
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
  });

  describe('Combined with esbuild-plugin-ast usage', () => {
    beforeEach(async () => {
      const pluginOptions: EsbuildAstParserOptions = {
        namespace,
        visitors,
      };

      ctx = await context({
        ...esbuildConfig,
        plugins: [
          esbuildAstParserVue({
            scriptNamespace: namespace,
            ...vuePluginOptions,
          }),
          esbuildAstParser(pluginOptions),
        ],
        entryPoints: { index: entryPoint },
        minify: true,
      });
    });

    it('should correctly handle dependencies containing astPlugin placeholder in script', async () => {
      const testDepFile = join(
        tmpDir,
        `./packages/${virtualPackage}/test-dep.js`,
      );

      const testDep = `export function test() { return ${placeholder}('${argument}'); }`;
      const testCase = `<script setup>import { test } from './test-dep.js'; test();</script>`;

      await writeFile(testDepFile, testDep);
      await writeFile(testFile, testCase);

      const result = await ctx.rebuild();

      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.stringContaining(argument),
      );
      expect((result.outputFiles as OutputFile[])[0].text).toEqual(
        expect.not.stringContaining(placeholder),
      );

      await rm(testDepFile);
    });
  });
});
