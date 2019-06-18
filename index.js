"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _fsExtra = require("fs-extra");

var _path = require("path");

var _inquirer = require("inquirer");

var _util = require("./util");

var _userData = require("./user-data");

var _Builder = _interopRequireDefault(require("./Builder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function parseArgv() {
  let targetDir;

  _commander.default.version('0.0.1', '-v, --version').arguments('<target>').option('--setTemplateDir <set template dir>', 'set template dir persistence').option('-t --templateDir <template dir>', 'set template dir').option('-k --koaServer', 'add koa server').option('-i --socketIO', 'add socket io server').option('-c --senecaClient', 'add seneca client').option('-s --senecaServer', 'add seneca server').option('-m --model', 'add model').option('-e --customerErrors <error-package>', 'add customer errors package').option('--yj <cloudnapps-template-dir>', 'build for cloudnapps').option('--si', 'skip yarn install').action(target => {
    targetDir = target;
  }).parse(process.argv);

  let {
    model,
    koaServer,
    socketIO,
    senecaClient,
    senecaServer,
    customerErrors,
    templateDir,
    setTemplateDir,
    yj,
    si
  } = _commander.default;

  if (setTemplateDir) {
    try {
      let gsConfig = await (0, _userData.setConfig)({
        templateDir: setTemplateDir
      });
      (0, _util.colorEcho)(JSON.stringify(gsConfig));
    } catch (e) {
      (0, _util.colorEcho)(e.message);
      process.exit(1);
    }

    process.exit(0);
  }

  if (!templateDir) {
    ({
      templateDir
    } = await (0, _userData.getConfig)());
  }

  if (!templateDir) {
    (0, _util.colorEcho)(' gs -t <use templateDir> or gs --setTemplateDir <set template dir>');
    process.exit(1);
  } // must be a type to generate


  if (!koaServer && !senecaClient && !senecaServer) {
    koaServer = true;
  } // socketIO must with koaServer


  if (socketIO && !koaServer) {
    (0, _util.colorEcho)('socketIo need koaServer; `gs -ki`');
    process.exit(1);
  }

  if (koaServer && senecaServer) {
    (0, _util.colorEcho)('koa server or seneca server should be only');
    process.exit(1);
  } // resolve target dir


  if (!targetDir) {
    (0, _util.colorEcho)('no target dir given!');
    process.exit(1);
  } else if (!/^\//.test(targetDir)) {
    targetDir = (0, _path.resolve)(process.cwd(), targetDir);
  }

  let targetDirIsExists = false;

  try {
    await (0, _fsExtra.stat)(targetDir);
    targetDirIsExists = true;
  } catch (e) {
    targetDirIsExists = false;
  }

  if (targetDirIsExists) {
    let {
      confirm
    } = await (0, _inquirer.prompt)({
      type: 'confirm',
      name: 'confirm',
      message: `${targetDir} is exists, cover it?`,
      default: false
    });

    if (!confirm) {
      (0, _util.colorEcho)(`${targetDir} exists`);
      process.exit(1);
    }
  }

  let info = {
    targetDir,
    templateDir,
    model,
    koaServer,
    socketIO,
    senecaClient,
    senecaServer,
    customerErrors,
    yj,
    skipInstall: yj ? true : si
  };
  let message = '';
  Object.keys(info).forEach(key => {
    if (info[key]) {
      message = `${message}${key}: ${info[key]}\n  `;
    }
  });
  let {
    confirm
  } = await (0, _inquirer.prompt)({
    type: 'confirm',
    name: 'confirm',
    message,
    default: true
  });

  if (!confirm) {
    process.exit(1);
  }

  return info;
}

(async () => {
  let result = await parseArgv();
  let builder = new _Builder.default(result);
  await builder.run();
})();
//# sourceMappingURL=index.js.map
