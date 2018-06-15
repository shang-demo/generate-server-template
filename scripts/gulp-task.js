/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

const gulp = require('gulp');
const pkg = require('../package.json');
const { promisify } = require('util');
const fs = require('fs');
const { resolve: pathResolve } = require('path');

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

let $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'streamqueue'],
  // ,lazy: false
});

let config = {
  clean: {
    src: ['./dist/**/*'],
    opt: {},
  },
  src: {
    src: ['**/*'],
    opt: {
      cwd: 'src/',
      base: 'src/',
    },
    dest: 'dist',
  },
  cp: {
    src: ['package.json'],
    opt: {
      cwd: './',
      base: './',
    },
    dest: 'dist',
  },
};

gulp.task('clean', () => {
  return $.del(config.clean.src, config.clean.opt);
});

gulp.task('lint', () => {
  let f = $.filter(['**/*.js'], { restore: true });

  return gulp
    .src(config.src.src, config.src.opt)
    .pipe(f)
    .pipe($.eslint());
});

gulp.task('babel', () => {
  let f = $.filter(['**/*.js'], { restore: true });

  return gulp
    .src(config.src.src, config.src.opt)
    .pipe(f)
    .pipe($.eslint())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(f.restore)
    .pipe(gulp.dest(config.src.dest));
});

gulp.task('cp', () => {
  return gulp.src(config.cp.src, config.cp.opt).pipe(gulp.dest(config.cp.dest));
});

gulp.task('pkg', async () => {
  pkg.devDependencies = {};
  pkg.scripts = {};
  pkg.bin = {
    stg: './bin/generate-server-template',
  };

  await writeFile(pathResolve(__dirname, '../dist/package.json'), JSON.stringify(pkg, null, 2));

  let binValue = `
#!/usr/bin/env node
require('./index.js');
`;

  await mkdir(pathResolve(__dirname, '../dist/bin'));
  await writeFile(pathResolve(__dirname, '../dist/bin/generate-server-template'), binValue);
});

gulp.task('build:dist', gulp.series('clean', 'lint', 'babel', 'pkg'));
