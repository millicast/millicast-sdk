/* eslint-disable */
export default {
  displayName: '@millicast/sdk',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
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
  testMatch: ['<rootDir>/tests/unit/**/*.steps.js', '<rootDir>/src/**/*.test.ts'],
  resolver: '<rootDir>/../../jest_resolver.cjs',
  coverageDirectory: '../../coverage/packages/millicast-sdk',
}
