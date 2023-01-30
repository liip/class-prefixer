import { dirname } from 'node:path';

import { parse } from '@vue/compiler-sfc';
import { Message } from 'esbuild';

export function resolvePath(filePath: string) {
  const [filename, query] = filePath.split('?', 2);

  return { filename, dirname: dirname(filename), query };
}

type ParseErrors = ReturnType<typeof parse>['errors'];

export function convertErrors(errors: ParseErrors, filename: string) {
  const convert = (e: ParseErrors[number]): Message => {
    let location: Message['location'] = null;

    if ('loc' in e && typeof e.loc !== 'undefined') {
      const start = e.loc.start;

      location = {
        file: filename,
        namespace: '',
        line: start.line + 1,
        column: start.column,
        length: e.loc.source.length,
        lineText: e.loc.source,
        suggestion: '',
      };
    }

    return {
      id: 'convertErrors',
      pluginName: 'ast-vue',
      text: e.message,
      location,
      notes: [],
      detail: '',
    };
  };

  return errors.map((e) => convert(e));
}

export function validateDependency() {
  try {
    require.resolve('@vue/compiler-sfc');
  } catch {
    throw new Error('@vue/compiler-sfc has not been installed');
  }
}
