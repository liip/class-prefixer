# esbuild-plugin-ast-vue

A plugin to generate an AST representation of your `.vue` files. The plugin use [Acorn](https://github.com/acornjs/acorn) to produce an `estree` compliant `AST` object. You can then apply transformations by providing a `visitor` object. In order to also parse your `.js` dependencies imported in your scripts, you should probably use the [@liip/esbuild-plugin-ast](https://github.com/liip/class-prefixer/tree/main/packages/esbuild-plugin-ast) in conjunction with this plugin since `esbuild` does not allow plugin composition.

## Installation

```
npm i -D @liip/esbuild-plugin-ast-vue @liip/esbuild-plugin-ast
```

## Usage

```javascript
import { astParser } from '@liip/esbuild-plugin-ast';
import { astParserVue } from '@liip/esbuild-plugin-ast-vue';

...

await esbuild.context({
  ...
  plugins: [astParserVue(vueParserOptions), astParser(parserOptions)],
  ...
});

...

```

## Options

You can configure the way the plugin works by setting different options.

```typescript
interface AstParserVueOptions extends AstParserOptions {
  scriptNamespace?: string;
  templateVisitor: AstParserOptions['visitor'];
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
}
```

### scriptNamespace

A string namespace used to tell `@liip/esbuild-plugin-ast` to parse `.js` dependencies from your `.vue` files. This is required since `esbuild` does not allow plugin composition. This namespace should also be provided to `astParser` in order to work correctly.

### visitor

An `ESTraverse.Visitor` object used to apply AST transformations. Check the [Estraverse documentation](https://github.com/estools/estraverse) form more information on the available API.

### templateVisitor

An `ESTraverse.Visitor` object used to apply AST transformations to the `JavaScript` produce by the template interpretation. Check the [Estraverse documentation](https://github.com/estools/estraverse) form more information on the available API.

### templateOptions

Template options passed to the underlying SFCCompiler. See the [`compileTemplate.ts` implementation](https://github.com/vuejs/vue/blob/main/packages/compiler-sfc/src/compileTemplate.ts) for more details

### scriptOptions

Script options passed to the underlying SFCCompiler. See the [`compileScript.ts` implementation](https://github.com/vuejs/vue/blob/main/packages/compiler-sfc/src/compileScript.ts) for more details

### styleOptions

Style options passed to the underlying SFCCompiler. See the [`compileStyle.ts` implementation](https://github.com/vuejs/vue/blob/main/packages/compiler-sfc/src/compileStyle.ts) for more details
