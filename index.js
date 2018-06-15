"use strict";

var _bluebird = _interopRequireDefault(require("bluebird"));

var _commander = _interopRequireDefault(require("commander"));

var _fsExtra = require("fs-extra");

var _path = require("path");

var _inquirer = require("inquirer");

var _util = require("./util");

var _build = require("./build");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function parseArgv() {
  let targetDir;

  _commander.default.version('0.0.1', '-v, --version').arguments('<target>').option('-k --koaServer', 'add koa server').option('-c --senecaClient', 'add seneca client').option('-s --senecaServer', 'add seneca server').option('-m --model', 'add model').option('-e --customerErrors <error-package>', 'add customer errors package').action(target => {
    targetDir = target;
  }).parse(process.argv); // must be a type to generate


  if (!_commander.default.koaServer && !_commander.default.senecaClient && !_commander.default.senecaServer) {
    _commander.default.koaServer = true;
  }

  if (_commander.default.koaServer && _commander.default.senecaServer) {
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
    dir: targetDir,
    model: _commander.default.model,
    koaServer: _commander.default.koaServer,
    senecaClient: _commander.default.senecaClient,
    senecaServer: _commander.default.senecaServer,
    customerErrors: _commander.default.customerErrors
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

  return targetDir;
}

(async () => {
  let targetDir = await parseArgv();
  let arr = [_build.ensureTargetDir, _build.cpBase, _build.buildComponents, _build.buildConfigFile, _build.buildIndexJs, _build.buildPackage];
  let {
    model,
    koaServer,
    senecaClient,
    senecaServer,
    customerErrors
  } = _commander.default;
  await _bluebird.default.each(arr, fun => {
    return fun(targetDir, {
      model,
      koaServer,
      senecaClient,
      senecaServer,
      customerErrors
    });
  });
})();
//# sourceMappingURL=index.js.map
