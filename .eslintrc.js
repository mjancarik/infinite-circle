module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parser: '@babel/eslint-parser',
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        bracketSameLine: true,
      },
    ],

    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
  },
  plugins: ['@babel', 'prettier', 'jest', 'jasmine'],
  settings: {
    ecmascript: 2015,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
    requireConfigFile: false,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jasmine: true,
    'jest/globals': true,
  },
  globals: {},
};
