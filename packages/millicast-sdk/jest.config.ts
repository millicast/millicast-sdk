/* eslint-disable */
export default {
  displayName: 'millicast-sdk',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  clearMocks: true,
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid')
  },
  resolver: './jest_resolver.js',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/millicast-sdk'
}
