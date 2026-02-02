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
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-empty-object-type': [
          'error',
          {
            allowObjectTypes: 'always'
          }
        ]
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
      version: 24
    }
  }
}
