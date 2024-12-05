/* eslint-disable */
export default {
  displayName: 'millicast-sdk',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|steps).[jt]s?(x)'],
  clearMocks: true,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
  resolver: './jest_resolver.js',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/millicast-sdk',
}
