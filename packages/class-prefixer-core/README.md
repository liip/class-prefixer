# class-prefixer-core

Core utilities of the `class-prefixer` packages.

## prefixer

The actual string prefixing implementation

```typescript
function prefixer(value: string, options?: PrefixerOptions): string;
```

### options

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

## classExpressionPrefixer

An helper function used to parse and prefix class names. It accept either a string, an object or an array. This can be used as a standalone alternative to prefix classes at runtime in environments that do not depend on a build chain.

```typescript
type ClassValue = string | Record<string, any> | ClassValue[];

function classExpressionPrefixer(
  classes: ClassValue,
  options?: PrefixerOptions,
): ClassValue;
```

## selectorPrefixer

An helper function used to parse and prefix `css` selectors. This can be used as a standalone alternative to prefix selectors at runtime in environments that do not depend on a build chain.

```typescript
function selectorPrefixer(value: string, options?: PrefixerOptions): string;
```
