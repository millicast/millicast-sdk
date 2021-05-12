/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  preset: 'jest-puppeteer',
  testMatch: [
    '**/*.steps.js'
  ],
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  }
}
