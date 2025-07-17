import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ['**/*.d.ts', 'src/drm/*', 'package.json', 'docs/', 'jest.config.ts'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {},
  },
  {
    files: ['**/*.ts'],
    rules: {},
  },
  {
    files: ['**/*.js'],
    rules: {},
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/*.steps.js',
      '**/*.test.js',
      '**/*/tests/**',
      '**/__mocks__/**',
    ],
    languageOptions: {
      globals: {
        jest: true,
      },
    },
    rules: {
      '@typescript-eslint/no-empty-function': [
        'error',
        {
          allow: [
            'functions', // Allows regular function declarations
            'arrowFunctions', // Allows empty arrow functions
            'methods', // Allows empty methods (e.g., in classes)
            'constructors', // Allows empty constructors
            'private-constructors', // Allows empty private constructors
            'protected-constructors', // Allows empty protected constructors
          ],
        },
      ],
      '@typescript-eslint/no-require-imports': ['off'],
    },
  },
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-undef': ['off'],
    },
  }
);
