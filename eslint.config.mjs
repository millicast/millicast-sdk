import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: [
      '.vscode/',
      '.github/',
      '**/*.d.ts',
      '**/node_modules/',
      '**/dist/',
      '**/coverage/',
      '**/docs/',
      'packages/millicast-viewer-demo/',
      'packages/millicast-multiview-demo/',
      '**/src/*.worker.js',
      '**/rtc-drm-transform.js',
      'packages/millicast-sdk/rollup.config.js',
      'packages/millicast-sdk/src/Logger.js',
      'packages/millicast-sdk/src/utils/Diagnostics.js',
      'packages/millicast-sdk/tests/unit/LoggerDiagnose.steps.js'
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...globals.jest }
    },
    rules: {
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }]
    }
  }
]
