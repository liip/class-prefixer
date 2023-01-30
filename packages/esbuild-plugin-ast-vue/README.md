# esbuild-plugin-ast

A plugin to generate an AST representation of your `.js` files. The plugin use (Acorn)[https://github.com/acornjs/acorn] to produce an `estree` compliant `AST` object. You can then apply transformations by providing a `visitor` object.

## Installation

```
npm i -D @liip/esbuild-plugin-ast
```

## Usage

```javascript
import { astParser } from '@liip/esbuild-plugin-ast';

...

await esbuild.context({
  ...
  plugins: [astParser(options)],
  ...
});

...

```

## Options

You can configure the way the plugin works by setting different options.

```typescript
interface AstParserVueOptions extends AstParserOptions {
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

### visitor

An `ESTraverse.Visitor` object used to apply AST transformations. Check the (Estraverse documentation)[https://github.com/estools/estraverse] form more information on the available API.

### templateVisitor

An `ESTraverse.Visitor` object used to apply AST transformations to the `JavaScript` produce by the template interpretation. Check the (Estraverse documentation)[https://github.com/estools/estraverse] form more information on the available API.

### templateOptions

Template options passed to the underlying SFCCompiler. See the (`compileTemplate.ts` implementation)[https://github.com/vuejs/vue/blob/main/packages/compiler-sfc/src/compileTemplate.ts] for more details

### scriptOptions

Script options passed to the underlying SFCCompiler. See the (`compileScript.ts` implementation)[https://github.com/vuejs/vue/blob/main/packages/compiler-sfc/src/compileScript.ts] for more details

### styleOptions

Style options passed to the underlying SFCCompiler. See the (`compileStyle.ts` implementation)[https://github.com/vuejs/vue/blob/main/packages/compiler-sfc/src/compileStyle.ts] for more details
