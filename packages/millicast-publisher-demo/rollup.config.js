import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: {
      name: "publisher",
      file: pkg.browser,
      format: "umd",
      globals: {
        'millicast-sdk-js': 'millicastSdkJs'
      }
    }
  },

  {
    input: 'src/index.js',
    output: [
      {file: pkg.main, format: 'cjs'},
      {file: pkg.module, format: 'es'},
    ]
  }
]