/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  testEnvironment: 'jsdom',
  clearMocks: true,
  coverageDirectory: 'coverage',
  preset: 'jest-puppeteer',
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid')
  }
}
