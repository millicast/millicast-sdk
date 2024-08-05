/* eslint-disable */
export default {
  displayName: 'millicast-multiviewer-demo',
  preset: '../../jest.preset.js',
  // setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^.+\\.[tj]s$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/millicast-multiviewer-demo',
};
