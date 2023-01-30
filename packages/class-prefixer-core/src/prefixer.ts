import { SelectorNodeType } from 'css-selector-tokenizer';

export type TestConditions = (string | RegExp)[];

export type PrefixOptions = {
  /**
   * Define the actual string used to prefix classes
   */
  value: string;

  /**
   * Strings or regular expressions to exclude certain classes
   * from the transformation.
   */
  excludes?: TestConditions;
};

export type ContainerExcludes = Partial<{
  [K in Extract<
    SelectorNodeType['type'],
    'element' | 'pseudo-class' | 'attribute'
  >]: string[] | RegExp[];
}>;

export type ContainerPreserveRoots = Partial<{
  [K in Extract<
    SelectorNodeType['type'],
    'element' | 'pseudo-class' | 'attribute'
  >]: TestConditions;
}>;

export type ContainerOptions = {
  /**
   * Define the actual string used to containerize classes
   */
  value: string;

  /**
   * An object of node types keys containing strings or regular expressions
   * to exclude certain elements from containerization
   */
  excludes?: ContainerExcludes;

  /**
   * An object of node types keys containing strings or regular expressions
   * specifying which elements should be kept at the root of the selector
   */
  preserveRoots?: ContainerPreserveRoots;
};

export type PrefixerOptions = {
  prefix?: PrefixOptions;
  container?: ContainerOptions;
};

export type Prefixer = (value: string, options?: PrefixerOptions) => string;

const breakpoints = [
  '2xs',
  'xs',
  'max-xs',
  'sm',
  'max-sm',
  'base',
  'max-base',
  'md',
  'max-md',
  'lg',
  'max-lg',
  'xl',
  'max-xl',
  '2xl',
] as const;

const breakpointsRegexp = new RegExp(`^((?:${breakpoints.join('|')}):)?(.*)$`);

/**
 * Prepends a prefix to a string value and honors excludes option.
 * This function doesn't make any assumption on the string format passed
 * to it and "blindly" add the prefix at the start of the string.
 */
export const prefixer: Prefixer = (value, options) => {
  if (!options || !options.prefix?.value) {
    return value;
  }

  const { prefix } = options;

  return value
    .split(' ')
    .map((part) => {
      /**
       * Part can sometimes be an empty string, we should avoid
       * prefixing that
       */
      if (!part) {
        return part;
      }

      /**
       * We don't want to prefix breakpoints sizes selector but only the actual
       * class names. So instead of this `prefix-md:class-name`, we want this
       * `md:prefix-class-name`
       */
      const [_, breakpoint = '', value] = part.match(breakpointsRegexp) || [];

      /**
       * There some cases were classes can be passed multiple times in the
       * prefixed, but we want to apply the prefix only once.
       */
      if (value.startsWith(prefix.value)) {
        return `${breakpoint}${value}`;
      }

      /**
       * If the current part is excluded from the transformation, we
       * want to return the original string
       */
      for (const exclude of prefix.excludes || []) {
        if (
          (typeof exclude === 'string' && value.includes(exclude)) ||
          (exclude instanceof RegExp && exclude.test(value))
        ) {
          return `${breakpoint}${value}`;
        }
      }

      return `${breakpoint}${prefix.value}${value}`;
    })
    .join(' ');
};
