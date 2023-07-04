# postcss-class-prefixer

Prefix classes in your stylesheet with ease. This plugin only prefixes your classes, leaving everything else intact, with the option of adding a global container to each selectors.

## Installation

```
npm i -D @liip/postcss-class-prefixer
```

## Example

Providing this stylesheet

```css
:root {
  --display: block;
}

body .btn {
  display: block;
}

[dir='rtl'].btn .btn--small {
  display: block;
}

* {
  display: block;
}

#btn button .btn:where(.btn--small, .btn--large):hover {
  display: block;
}

.md\:btn {
  display: block;
}

@media (hover: none), (pointer: coarse) {
  .btn:is(.btn--small, .btn--large):hover .btn--primary.excluded {
    display: block;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

This plugin will output

```css
/* stylelint-disable selector-max-id, selector-no-qualifying-type, no-duplicate-selectors */

:root {
  --display: block;
}

body .prefix-btn {
  display: block;
}

[dir='rtl'].prefix-btn .prefix-btn--small {
  display: block;
}

* {
  display: block;
}

#btn button .prefix-btn:where(.prefix-btn--small, .prefix-btn--large):hover {
  display: block;
}

.md\:prefix-btn {
  display: block;
}

@media (hover: none), (pointer: coarse) {
  .prefix-btn:is(.prefix-btn--small, .prefix-btn--large):hover
    .prefix-btn--primary.excluded {
    display: block;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

## Usage

```javascript
// postcss.config.js

const options = {
  prefix: {
    value: 'prefix-',
  },
};

module.exports = {
  plugins: [...require('@liip/postcss-class-prefixer')(options)],
};
```

## Options

You can configure the way the plugin works by setting different options.

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

**`value`**

Define the actual string used to containerize classes

**`excludes`**

An object of node types keys containing strings or regular expressions to exclude certain elements from containerization

**`preserveRoots`**

An object of node types keys containing strings or regular expressions specifying which elements should be kept at the root of the selector
