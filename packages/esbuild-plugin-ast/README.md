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
interface AstParserOptions {
  dependencies?: string[];
  visitor: ESTraverse.Visitor;
}
```

### dependencies

An array of node module dependencies on which this plugin should also operate.

### visitor

An `ESTraverse.Visitor` object used to apply AST transformation. Check the (Estraverse documentation)[https://github.com/estools/estraverse] form more information on the available API.
