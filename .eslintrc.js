module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  plugins: ["jest"],
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: "module",
  },
  settings: {
    jest: {
      version: 24,
    },
  },
};
