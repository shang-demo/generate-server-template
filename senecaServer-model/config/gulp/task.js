/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

const notifier = require('node-notifier');
const gulp = require('gulp');
const nodemon = require('nodemon');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const replace = require('gulp-replace');

const utilities = require('./utilities');

const defaultNodemonEvent = {
  crash() {
    console.error('Application has crashed!\n');
    notifier.notify({
      title: 'crashed!',
      message: utilities.formatDate('hh:mm:ss'),
    });
  },
  start() {
    notifier.notify({
      title: 'restarting!',
      message: utilities.formatDate('hh:mm:ss'),
    });
  },
};

let gulpConfig = require('./config.js');

let specConfig = null; // 在环境初始化之后再读取配置
let config = null;

let $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'streamqueue'],
  // ,lazy: false
});

$.utilities = utilities;
$.isBuild = false;
$.isStatic = false;
$.specConfig = specConfig;
$.config = config;
$.isNeedInjectHtml = false;

// set default env
// eslint-disable-next-line no-underscore-dangle
gulpConfig.__alterableSetting__ = {};
// eslint-disable-next-line no-underscore-dangle
copyAttrValue(gulpConfig.__alterableSetting__, gulpConfig.alterableSetting);
setDevEnv();

function copyAttrValue(obj, copyObj) {
  if (!obj || !copyObj) {
    return obj;
  }

  Object.keys(copyObj).forEach((attr) => {
    obj[attr] = copyObj[attr];
  });

  return obj;
}

function getConfig() {
  config = gulpConfig.getCommonConfig();
  $.config = config;
}

function setDevEnv(done) {
  getConfig();
  return done && done();
}

function validConfig(setting, name = 'src') {
  return setting[name] && setting[name].length;
}

gulp.task('clean', () => {
  return $.del(config.clean.src, config.clean.options);
});

gulp.task('lint', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe($.cached('serverJs'))
    .pipe($.eslint())
    .pipe($.eslint.result((result) => {
      utilities.eslintReporter(result);
    }))
    .pipe($.remember('serverJs'));
});

gulp.task('wlint', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  let lintTimer = null;

  gulp.series('lint')();
  gulp.watch(config.server.src, config.server.opt).on('change', (filePath) => {
    clearTimeout(lintTimer);

    lintTimer = setTimeout(() => {
      utilities
        .spawnDefer({
          cmd: 'clear',
          arg: [],
        })
        .then(() => {
          console.info(`${filePath} do eslint`);
          // js文件需要 lint
          gulp.series('lint')();
        })
        .catch((e) => {
          console.warn(e);
          console.info(`${filePath} do eslint`);
          // js文件需要 lint
          gulp.series('lint')();
        });
    });
  });

  return done();
});

gulp.task('nodemon', (done) => {
  nodemon(config.nodemon.config);

  Object.keys(config.nodemon.events).forEach((eventName) => {
    let event = config.nodemon.events[eventName];
    if (typeof eventName === 'function') {
      nodemon.on(eventName, event);
    }
    else if (event === true && defaultNodemonEvent[eventName]) {
      nodemon.on(eventName, defaultNodemonEvent[eventName]);
    }
    else if (event === undefined || event === false) {
      return null;
    }
    else {
      console.warn(`nodemon event not support for ${eventName}`);
    }
    return null;
  });

  return done();
});

gulp.task('babel', () => {
  let f = $.filter(['**/*.js'], { restore: true });
  let replaceFilter = $.filter(config.replace.src, { restore: true });

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe(f)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(f.restore)
    .pipe(replaceFilter)
    .pipe(replace(config.replace.regexp, config.replace.newSubstr))
    .pipe(replaceFilter.restore)
    .pipe(gulp.dest(config.server.dest));
});

gulp.task('cp', () => {
  return gulp.src(config.cp.src, config.cp.opt).pipe(gulp.dest(config.cp.dest));
});

gulp.task('default', gulp.series(setDevEnv, gulp.parallel('nodemon', 'wlint')));
gulp.task('build:dist', gulp.series(setDevEnv, 'clean', 'lint', 'babel', 'cp'));
