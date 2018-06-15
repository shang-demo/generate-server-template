/** **** start: 用户配置********** */
let alterableSetting = {
  // prod 的 基础路径
  basePath: './dist/',
};

function getCommonConfig() {
  return {
    clean: {
      // 清除生成文件的路径
      src: [`${alterableSetting.basePath}**/*`],
      options: {
        force: true,
      },
    },
    server: {
      src: ['**/*', '!views/**/*'],
      opt: {
        cwd: 'src/',
        base: 'src/',
      },
      dest: alterableSetting.basePath,
    },
    replace: {
      src: ['index.js'],
      regexp: '../package.json',
      newSubstr: './package.json',
    },
    cp: {
      src: ['package.json'],
      opt: {
        cwd: './',
        base: './',
      },
      dest: alterableSetting.basePath,
    },
    nodemon: {
      config: {
        script: 'src/index.js',
        ext: 'js',
        watch: ['src/'],
        env: {
          NODE_ENV: 'development',
        },
        // if you want use attach debug, use `INSPECT=9229 gulp`
        args: process.env.INSPECT ? [`--inspect=${process.env.INSPECT}`] : '',
        // for es6+
        exec: 'babel-node',
      },
      events: {
        crash: true,
        start: false,
      },
    },
  };
}

module.exports = {
  alterableSetting,
  getCommonConfig,
};
