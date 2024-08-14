import { readFile } from 'node:fs/promises';
import { dirname, extname } from 'node:path';

import { Visitor } from 'estraverse';
import * as ts from 'typescript';

import { parser } from './parser';
import { tsParser } from './ts-parser';
import { loadTsConfig } from './utils';

import type { Plugin, OnResolveArgs } from 'esbuild';

export interface AstParserOptions {
  dependencies?: string[];
  visitors?: Visitor | Visitor[] | undefined;
  tsTransformers?:
    | ts.TransformerFactory<ts.Node>
    | ts.TransformerFactory<ts.Node>[]
    | undefined;
  namespace?: string;
}

export function astParser({
  dependencies,
  visitors,
  tsTransformers,
  namespace = 'ast-parser',
}: AstParserOptions): Plugin {
  return {
    name: 'astParser',
    setup(build) {
      const excludeFileTypes = Object.keys(
        build.initialOptions.loader || {},
      ).map((key) => key.slice(1));

      const tsConfig = loadTsConfig('./tsconfig.json');

      /**
       * Use the entry points as starting point for the plugin
       */
      build.onResolve({ filter: /\.(j|t)s/, namespace: 'file' }, (args) => {
        if (args.kind !== 'entry-point') {
          return;
        }

        return {
          path: args.path,
          namespace,
        };
      });

      /**
       * Handle relative dependencies
       */
      build.onResolve({ filter: /^\./, namespace }, async (args) => {
        const result = await build.resolve(args.path, {
          kind: 'import-statement',
          resolveDir: dirname(args.importer),
        });

        const fileType = result.path.split('.').pop();

        if (fileType && excludeFileTypes.includes(fileType)) {
          return {
            path: result.path,
            namespace: 'file',
          };
        }

        return {
          path: result.path,
          namespace,
        };
      });

      const resolveDeps = async (args: OnResolveArgs) => {
        const result = await build.resolve(args.path, {
          kind: 'import-statement',
          resolveDir: dirname(args.importer),
        });

        /**
         * If the dependency is marked as `external`, we return `undefined` to
         * let default esbuild process takes control
         */
        if (result.external) {
          return;
        }

        /**
         * If the dependency comes from a package listed in the `dependencies` option,
         * we want to treat it with this plugin
         */
        if (
          Array.isArray(dependencies) &&
          dependencies.some((dep) => args.path.startsWith(dep))
        ) {
          return {
            path: result.path,
            namespace,
          };
        }

        /**
         * Otherwise, we put node module dependencies back into the `file`
         * namespace so they can be handled through the standard flow.
         */
        return {
          path: result.path,
          namespace: 'file',
        };
      };

      /**
       * Handle node modules dependencies imported from files parsed by
       * this module and other modules
       */
      build.onResolve({ filter: /^[@a-zA-Z]/, namespace: 'file' }, resolveDeps);
      build.onResolve({ filter: /^[@a-zA-Z]/, namespace }, resolveDeps);

      /**
       * Load, parse and modify any other imports that was placed in
       * the `ast-parser` namespace
       */
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const source = await readFile(args.path, 'utf-8');
        const isTs = extname(args.path).split('?')[0] === '.ts';

        if (isTs && tsConfig) {
          return {
            contents: tsParser({
              path: args.path,
              source,
              transformers: tsTransformers,
              tsConfig,
            }),
            loader: 'ts',
          };
        }

        return {
          contents: parser(source, visitors),
          loader: 'js',
        };
      });
    },
  };
}

export { parser, tsParser, loadTsConfig };
