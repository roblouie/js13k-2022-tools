module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ['unused-imports'],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'prefer-destructuring': 'off',
    camelcase: 'off',
    'no-use-before-define': ['error', { variables: true, functions: false, classes: true }],
    'id-length': [2, { exceptions: ['i', 'j', 'L'], properties: 'never' }],
    'max-classes-per-file': ['error', 1],
    'max-len': 'warn',
    'no-global-assign': ['error', { exceptions: ['Object'] }],
    'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',
    'import/prefer-default-export': 'off',
    'guard-for-in': 'error',
    'comma-dangle': ['warn', 'always-multiline'],
    'arrow-parens': 'off',
    semi: 'warn',
    'arrow-body-style': 'off',
    'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 1 }],
    'lines-between-class-members': 'off',
    yoda: 'error',
    'no-unused-vars': 'off',
    'no-bitwise': 'off',
    'no-plusplus': 'off',
    'class-methods-use-this': 'warn',
    'linebreak-style': 0,
    'no-param-reassign': 'warn',
    'function-paren-newline': 'off',
    'import/extensions': 'warn',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
