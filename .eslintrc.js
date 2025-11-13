module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true
  },
  plugins: ['jest', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Apply these settings only to TypeScript files
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
      ]
    },
    {
      files: ['*.js'], // Apply these settings only to JavaScript files
      extends: ['standard', 'eslint:recommended']
    }
  ],
  settings: {
    jest: {
      version: 24
    }
  }
}
