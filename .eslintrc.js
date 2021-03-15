module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  plugins: ["jest"],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    experimentalObjectRestSpread: true,
  },
  settings: {
    jest: {
      version: 24,
    },
  },
};
