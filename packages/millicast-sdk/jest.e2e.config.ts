export default {
  displayName: '@millicast/sdk-e2e',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: [
    '<rootDir>/tests/e2e/**/*.steps.js',
    '<rootDir>/tests/e2e/**/*.step.js',
    '<rootDir>/tests/e2e/**/*.test.js',
  ],
  transformIgnorePatterns: ['<rootDir>/../../puppeteerrc.cjs$'],
  resolver: '<rootDir>/../../jest_resolver.cjs',
};
