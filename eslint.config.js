import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
   { files: ['**/*.{js,mjs,cjs,ts}'] },
   { languageOptions: { globals: globals.node } },
   pluginJs.configs.recommended,
   ...tseslint.configs.recommended,
   {
      rules: {
         '@typescript-eslint/no-shadow': ['error', { allow: ['err', 'resolve', 'reject'] }],
         '@typescript-eslint/no-explicit-any': 'off',
         '@typescript-eslint/no-unused-expressions': 'off',
         '@typescript-eslint/no-unused-vars': 'off', // ['warn', { argsIgnorePattern: '^_' }],
         'handle-callback-err': 'error',
         'max-nested-callbacks': ['error', { max: 4 }],
         'no-console': 'off',
         'no-empty-function': 'error',
         'no-lonely-if': 'warn',
         'no-unused-vars': 'off',
         'no-useless-escape': 'off',
         'prefer-const': 'warn',
      },
   },
];
