# class-prefixer-ast-visitor

Ready to use `ESTraverse.Visitor` implementation to prefix classes and `css` selectors. Those implementation can be use along [esbuild-plugin-ast](https://github.com/liip/class-prefixer/tree/main/packages/esbuild-plugin-ast) and [esbuild-plugin-ast-vue](https://github.com/liip/class-prefixer/tree/main/packages/esbuild-plugin-ast-vue) plugins.

## createVisitor

Transform `classPrefixer('btn')` into `'prefix-btn'` and `selectorPrefixer('.btn:hover')` into `'.prefix-btn:hover'` at build time. If you use `Esbuild` to lint your code, you probably want to define both of those placeholders as global.

```javascript
// .eslintrc.js
module.exports = {
  ...
  globals: {
    classPrefixer: true,
    selectorPrefixer: true,
  },
}
```

```typescript
function createVisitor(config?: PrefixerOptions): Visitor;
```

## createVueTemplateVisitor

Transform any reference to `class` expression in `Vue` template. It support both static and dynamic class expressions such as `<div class="btn"></div>` or `<div :class="['btn', { 'btn--small': isSmall }]"></div>`. The resulting `AST` will be equivalent to respectively `<div class="prefix-btn"></div>` and `<div :class="['prefix-btn', { 'prefix-btn--small': isSmall }]"></div>`.

```typescript
function createVueTemplateVisitor(config?: PrefixerOptions): Visitor;
```

## options

```typescript
type PrefixerOptions = {
  prefix?: PrefixOptions;
  container?: ContainerOptions;
};
```

### prefix

Define the class prefix options

```typescript
type PrefixOptions = {
  value: string;
  excludes?: TestConditions;
};

type TestConditions = (string | RegExp)[];
```

**`value`**

Define the actual string used to prefix classes

**`excludes`**

Strings or regular expressions to exclude certain classes from the transformation.

### container

Define containerization options

```typescript
type ContainerOptions = {
  value: string;
  excludes?: ContainerExcludes;
  preserveRoots?: ContainerPreserveRoots;
};

type ContainerExcludes = {
  element?: TestConditions | undefined;
  'pseudo-class'?: TestConditions | undefined;
  attribute?: TestConditions | undefined;
};

type ContainerPreserveRoots = {
  element?: TestConditions | undefined;
  'pseudo-class'?: TestConditions | undefined;
  attribute?: TestConditions | undefined;
};

type TestConditions = (string | RegExp)[];
```
