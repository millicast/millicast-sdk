module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true
  },
  plugins: ['jest'],
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    },
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  settings: {
    jest: {
      version: 24
    }
  },
  extends: 'standard',
  globals: {
    RTCEncodedVideoFrame: true
  }
}
