module.exports={
  env: {
    browser: true,
    node: true,
    jest: true,
    es2020: true
  },
  plugins: ['jest', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          experimentalObjectRestSpread: true
        },
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic'
      ],
      rules: {
        '@typescript-eslint/no-empty-object-type': [
          'error',
          {
            allowObjectTypes: 'always'
          }
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports'
          }
        ],
        '@typescript-eslint/no-explicit-any': 'error'
      }
    },
    {
      files: ['*.js'],
      extends: ['eslint:recommended'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    {
      files: [
        '**/tests/**/*.js',
        '**/mocks/**/*.js',
        '**/__mocks__/**/*.js'
      ],
      rules: {
        'no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }]
      }
    }
  ],
  settings: {
    jest: {
      version: 30
    }
  }
}
