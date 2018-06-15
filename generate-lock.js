"use strict";

var _bluebird = _interopRequireDefault(require("bluebird"));

var _path = require("path");

var _shelljs = require("shelljs");

var _index = require("./yarn-lock/index");

var _build = require("./build");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tempDir = (0, _path.resolve)(__dirname, '../dist');
let options = [{
  koaServer: true
}, {
  koaServer: true,
  senecaClient: true
}, {
  senecaServer: true
}, // same as {senecaServer: true}
// { senecaServer: true, senecaClient: true },
{
  koaServer: true,
  model: true
}, {
  koaServer: true,
  senecaClient: true,
  model: true
}, {
  senecaServer: true,
  model: true
}];
let arr = [_build.ensureTargetDir, _build.cpBase, _build.buildComponents, _build.buildConfigFile, _build.buildIndexJs]; // must be each, because build use same memory

_bluebird.default.each(options, async option => {
  console.info('option: ', option);
  let targetDir = (0, _path.resolve)(tempDir, Object.keys(option).join('-'));
  await (0, _shelljs.exec)(`rm -rf ${targetDir}`);

  try {
    await _bluebird.default.each(arr, fun => {
      return fun(targetDir, option);
    });
    let lockPath = await (0, _index.getLockPath)(option);
    console.info('lockPath: ', lockPath);

    if (lockPath) {
      await (0, _shelljs.exec)(`rm -rf ${lockPath}`);
    }

    await (0, _build.buildPackage)(targetDir, option);
    await (0, _shelljs.cp)((0, _path.resolve)(targetDir, 'yarn.lock'), lockPath);
  } catch (e) {
    console.warn(e);
  }

  await (0, _shelljs.exec)(`rm -rf ${targetDir}`);
});
//# sourceMappingURL=generate-lock.js.map
