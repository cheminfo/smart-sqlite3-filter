import cheminfo from 'eslint-config-cheminfo-typescript';

export default [
  ...cheminfo,
  {
    rules: {
      // disable require-jsdoc
      'jsdoc/require-jsdoc': 'off',
    }

  }
];



