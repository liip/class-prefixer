import { readFile } from 'node:fs/promises';
import { URLSearchParams } from 'node:url';

import { loadTsConfig, jsParser, tsParser } from '@liip/ast-parsers';
import { EsbuildAstParserOptions } from '@liip/esbuild-plugin-ast';
import {
  SFCTemplateCompileOptions,
  SFCScriptCompileOptions,
  SFCAsyncStyleCompileOptions,
} from '@vue/compiler-sfc';
import { Plugin } from 'esbuild';
import { Visitor } from 'estraverse';

import { loadEntry } from './entry';
import { resolveScript } from './script';
import { resolveStyle } from './style';
import { resolveTemplate } from './template';
import { resolvePath, validateDependency } from './utils';

type ExtractNonArray<T> = T extends Array<any> ? never : T;

export interface EsbuildAstParserVueOptions
  extends Omit<EsbuildAstParserOptions, 'namespace'> {
  templateOptions?: Pick<
    SFCTemplateCompileOptions,
    | 'compiler'
    | 'preprocessLang'
    | 'preprocessOptions'
    | 'compilerOptions'
    | 'transformAssetUrls'
  >;
  scriptOptions?: Pick<SFCScriptCompileOptions, 'babelParserPlugins'>;
  styleOptions?: Pick<
    SFCAsyncStyleCompileOptions,
    | 'modulesOptions'
    | 'preprocessLang'
    | 'preprocessOptions'
    | 'postcssOptions'
    | 'postcssPlugins'
  >;
  templateVisitor: ExtractNonArray<EsbuildAstParserOptions['visitors']>;
  scriptNamespace?: string;
}

type ScriptResolvedReturn = { path: string; namespace?: string };

validateDependency();

export function esbuildAstParserVue({
  templateOptions,
  scriptOptions,
  styleOptions,
  visitors,
  tsTransformers,
  templateVisitor,
  scriptNamespace,
}: EsbuildAstParserVueOptions): Plugin {
  return {
    name: 'astParserVue',
    setup(build) {
      const { sourcemap } = build.initialOptions;
      const isProd = process.env.NODE_ENV === 'production';

      const tsConfig = loadTsConfig('./tsconfig.json');

      build.onLoad({ filter: /\.vue$/ }, async (args) => {
        const source = await readFile(args.path, 'utf8');

        const { code, errors } = loadEntry({
          source,
          filename: args.path,
          sourcemap: !!sourcemap,
        });

        return {
          contents: code,
          errors,
        };
      });

      /**
       * Script can import other dependencies and we don´t want to place
       * them in a specific namespace
       */
      build.onResolve({ filter: /\.vue\?type=script/ }, (args) => {
        const resolved: ScriptResolvedReturn = {
          path: args.path,
        };

        if (scriptNamespace) {
          resolved.namespace = scriptNamespace;
        }

        return resolved;
      });

      build.onLoad({ filter: /\.vue\?type=script/ }, (args) => {
        const { filename, dirname } = resolvePath(args.path);

        const { code, error, isTs } = resolveScript({
          filename,
          scriptOptions,
          templateOptions,
          isProd,
          sourcemap: !!sourcemap,
        });

        if (isTs && tsConfig) {
          return {
            contents: tsParser({
              path: args.path,
              source: code,
              transformers: tsTransformers,
              tsConfig,
            }),
            loader: 'ts',
            resolveDir: dirname,
            errors: error,
          };
        }

        const availableVisitors: Visitor[] = [];

        if (visitors) {
          (Array.isArray(visitors) ? visitors : [visitors]).forEach(
            (visitor) => {
              availableVisitors.push(visitor);
            },
          );
        }

        if (templateVisitor) {
          availableVisitors.push(templateVisitor);
        }

        return {
          contents: jsParser(code, args.path, availableVisitors).code,
          errors: error,
          resolveDir: dirname,
          loader: 'js',
        };
      });

      build.onResolve({ filter: /\.vue\?type=template/ }, (args) => {
        return {
          path: args.path,
          namespace: 'vue-template',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'vue-template' }, (args) => {
        const { filename, dirname } = resolvePath(args.path);

        const { code, errors } = resolveTemplate({
          filename,
          options: templateOptions,
          isProd,
        });

        return {
          contents: jsParser(code, args.path, templateVisitor).code,
          pluginData: { code },
          errors,
          resolveDir: dirname,
        };
      });

      build.onResolve({ filter: /\.vue\?type=style/ }, (args) => {
        return {
          path: args.path,
          namespace: 'vue-style',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'vue-style' }, async (args) => {
        const { filename, dirname, query } = resolvePath(args.path);
        const params = new URLSearchParams(query);

        const moduleWithNameImport = !!(
          params.get('isModule') && params.get('isNameImport')
        );

        const { styleCode, errors } = await resolveStyle({
          filename,
          styleOptions,
          index: Number(params.get('index')),
          isModule: !!params.get('isModule'),
          moduleWithNameImport,
          isProd,
        });

        return {
          contents: styleCode,
          errors,
          resolveDir: dirname,
          loader: moduleWithNameImport ? 'json' : 'css',
        };
      });
    },
  };
}
