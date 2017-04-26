import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import eslint from 'rollup-plugin-eslint';
import { minify } from 'uglify-js';

const isProd = process.env.PROD;
const moduleName = require('./package.json').config.moduleName;
const plugins = [
  eslint(),
  json(),
  babel({ exclude: 'node_modules/**' }),
  nodeResolve({ jsnext: true, main: true }),
  commonjs()
];

if (isProd) {
  plugins.push(uglify({}, minify));
}

export default {
  entry: 'lib/main.js',
  format: 'umd',
  external: [
    'jquery'
  ],
  moduleName,
  plugins,
  dest: 'dist/McBrightcove.js',
  sourceMap: !isProd
};
