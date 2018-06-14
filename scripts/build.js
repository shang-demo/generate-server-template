/* eslint-disable import/no-extraneous-dependencies */

const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const eslint = require('rollup-plugin-eslint');
const { dependencies } = require('../package.json');

const external = Object.keys(dependencies);

const builtins = Object.keys(process.binding('natives')).filter((str) => {
  return /^(?!(?:internal|node|v8)\/)/.test(str);
});
external.push(...builtins);

const mainConfig = {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.cjs.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    json(),
    resolve(),
    eslint(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
  ],
  external,
};

const lockConfig = {
  input: 'src/generate-lock/generate-lock.js',
  output: {
    file: 'dist/generate-lock.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    json(),
    resolve(),
    eslint(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
  ],
  external,
};

async function build(config) {
  // create a bundle
  const bundle = await rollup.rollup(config);
  // or write the bundle to disk
  await bundle.write(config.output);
}

Promise.all([build(mainConfig), build(lockConfig)]).catch((e) => {
  // eslint-disable-next-line no-console
  console.warn(e);
});
