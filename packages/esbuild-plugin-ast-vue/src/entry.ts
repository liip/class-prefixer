import { parse } from '@vue/compiler-sfc';

import { setDescriptorCache, setId } from './cache';
import { convertErrors } from './utils';

export function loadEntry({
  source,
  filename,
  sourcemap,
}: {
  source: string;
  filename: string;
  sourcemap: boolean;
}) {
  const { descriptor, errors } = parse(source, {
    sourceMap: sourcemap,
    filename,
  });

  setDescriptorCache(filename, descriptor);

  const scopeId = setId(filename);

  const scriptPath = JSON.stringify(`${filename}?type=script`);
  const scriptImportCode = `import script from ${scriptPath}\nexport * from ${scriptPath}`;
  const scriptExportCode = 'export default script';

  let templateImportCode = '';
  let templateBindCode = '';
  let styleImportCode = '';
  let hasModuleInject = false;
  let scopeIdInject = '';

  if (!descriptor.scriptSetup && descriptor.template) {
    const templatePath = JSON.stringify(`${filename}?type=template`);

    templateImportCode += `import { render } from ${templatePath}`;
    templateBindCode += `\nscript.render = render`;
  }

  descriptor.styles.forEach((styleBlock, i) => {
    const stringIndex = String(i);
    const stylePath = `${filename}?type=style&index=${stringIndex}`;

    if (styleBlock.module) {
      const moduleName =
        typeof styleBlock.module === 'string' ? styleBlock.module : '$style';
      const importVarName = `__style${stringIndex}`;

      if (!hasModuleInject) {
        styleImportCode += `\nscript.__cssModules = cssModules = {}`;
        hasModuleInject = true;
      }

      styleImportCode += `\nimport ${importVarName} from ${JSON.stringify(
        `${stylePath}&isModule=true&isNameImport=true`,
      )}`;

      styleImportCode += `\ncssModules[${JSON.stringify(
        moduleName,
      )}] = ${importVarName}`;

      styleImportCode += `\nimport ${JSON.stringify(
        `${stylePath}&isModule=true`,
      )}`;
    } else {
      styleImportCode += `\nimport ${JSON.stringify(stylePath)}`;
    }
  });

  if (descriptor.styles.some((styleBlock) => styleBlock.scoped)) {
    scopeIdInject += `script.__scopeId = ${JSON.stringify(scopeId)}`;
  }

  const code = [
    scriptImportCode,
    templateImportCode,
    templateBindCode,
    styleImportCode,
    scriptExportCode,
    scopeIdInject,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    code,
    errors: convertErrors(errors, filename),
  };
}
