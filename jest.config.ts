import baseConfig from './jest.base.config';

import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  ...baseConfig,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputName: 'jest-results.xml',
        suiteNameTemplate: '{filename}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' > ',
      },
    ],
  ],
  projects: ['<rootDir>/packages/**/jest.config.ts'],
};

export default jestConfig;
