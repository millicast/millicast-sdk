import pkg from './package.json'
import dts from 'rollup-plugin-dts'

export default [
  {
    input: './src/types/index.d.ts',
    output: [{ file: pkg.types, format: 'es' }],
    plugins: [dts()]
  }
]
