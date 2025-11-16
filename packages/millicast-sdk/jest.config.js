/* eslint-disable */
import {resolve} from 'path';

export default {
  displayName: 'millicast-sdk',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  clearMocks: true,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {tsconfig: '<rootDir>/tsconfig.spec.json'}],
  },
  moduleNameMapper: {
    '^uuid$': resolve('uuid'),
  },
  resolver: './jest_resolver.js',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/millicast-sdk',
}