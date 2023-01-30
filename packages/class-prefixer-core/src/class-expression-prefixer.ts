import { prefixer, PrefixerOptions } from './prefixer';

export type ClassValue = string | Record<string, any> | ClassValue[];

/**
 * Helper function used to parse and prefix class names. This function accept
 * either a string, an object or an array.
 */
export function classExpressionPrefixer(
  classes: ClassValue,
  options?: PrefixerOptions,
): ClassValue {
  if (Array.isArray(classes)) {
    /**
     * Recursively parse and prefix every array members
     */
    return classes.map((c: ClassValue) => classExpressionPrefixer(c, options));
  }

  if (typeof classes === 'object' && classes !== null) {
    /**
     * For objects, we want to loop through every keys to prefix them
     */
    const prefixed: { [key: string]: any } = {};

    for (const key in classes) {
      prefixed[prefixer(key, options)] = classes[key];
    }

    return prefixed;
  }

  if (typeof classes === 'string') {
    /**
     * String literal can be prefix without further operation
     */
    return prefixer(classes, options);
  }

  return classes;
}
