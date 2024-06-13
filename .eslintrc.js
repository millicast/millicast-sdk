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
    sourceType: 'module'
  },
  settings: {
    jest: {
      version: 28
    }
  },
  extends: 'standard'
}
