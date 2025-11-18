/* eslint-disable */

export default {
  displayName: 'millicast-sdk',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  clearMocks: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {tsconfig: '<rootDir>/tsconfig.spec.json'}],
    '^.+\\.js$': 'babel-jest',  // Use babel-jest for .js files
  },
  resolver: './jest_resolver.js',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/millicast-sdk',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-cucumber|@cucumber|uuid)/)'
  ],
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globals: {
    'import.meta': {
      url: 'file://mock-url'
    }
  }
}
