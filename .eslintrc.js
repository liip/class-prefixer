module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    '@liip-lausanne',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/extensions': ['.ts', '.tsx', '.js', '.jsx'],
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
      },
      node: true,
    },
  },
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    /*
     * Loosing a bit the type checking since some patterns requires some
     * unsafe return. Also warnings all over the place are not really useful
     * and tsc itself doesn't report them.
     */
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',

    '@typescript-eslint/ban-ts-comment': 'off',

    /* Use TypeScript rules instead of JavaScript */
    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': 'error',

    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': 'error',

    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': 'error',

    'no-duplicate-imports': 'off',
    '@typescript-eslint/no-duplicate-imports': 'off',

    'no-loop-func': 'off',
    '@typescript-eslint/no-loop-func': 'error',

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        destructuredArrayIgnorePattern: '^_',
      },
    ],

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',

    /* handle imports grouping and validation */
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/named': 'error',
    'import/first': 'error',
    'import/no-unresolved': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',

    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'warn',
    'import/no-duplicates': 'warn',
  },
};
