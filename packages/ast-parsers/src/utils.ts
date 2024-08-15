import { dirname } from 'node:path';

import * as ts from 'typescript';

export const isFunction = (v: unknown) =>
  [
    '[object Function]',
    '[object GeneratorFunction]',
    '[object AsyncFunction]',
    '[object Promise]',
  ].includes(Object.prototype.toString.call(v));

export function loadTsConfig(tsconfig: string, cwd = process.cwd()) {
  const fileName = ts.findConfigFile(
    cwd,
    ts.sys.fileExists, // eslint-disable-line @typescript-eslint/unbound-method
    tsconfig,
  );

  if (tsconfig !== undefined && !fileName) {
    return null;
  }

  let loadedConfig = {};
  let baseDir = cwd;

  if (fileName) {
    const text = ts.sys.readFile(fileName);
    if (text === undefined) throw new Error(`failed to read '${fileName}'`);

    const result = ts.parseConfigFileTextToJson(fileName, text);

    if (result.error !== undefined) {
      // eslint-disable-next-line no-console
      console.error(result.error);
      throw new Error(`failed to parse '${fileName}'`);
    }

    loadedConfig = result.config;
    baseDir = dirname(fileName);
  }

  const parsedTsConfig = ts.parseJsonConfigFileContent(
    loadedConfig,
    ts.sys,
    baseDir,
  );

  if (parsedTsConfig.errors[0]) {
    // eslint-disable-next-line no-console
    console.error(parsedTsConfig.errors);
  }

  return parsedTsConfig;
}
