import {createRequire} from 'module';
const require=createRequire(import.meta.url);
const pkg=require('./package.json');

import {dts} from 'rollup-plugin-dts'

export default [
  {
    input: './src/types/index.d.ts',
    output: [{ file: pkg.types, format: 'es' }],
    plugins: [dts()]
  }
]
