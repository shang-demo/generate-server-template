"use strict";

var _bluebird = _interopRequireDefault(require("bluebird"));

var _path = require("path");

var _util = require("./util");

var _index = require("./yarn-lock/index");

var _Builder = _interopRequireDefault(require("./Builder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const templateDir = process.env.TEMPLATE_DIR;
console.info('templateDir: ', templateDir);
let options = [{
  koaServer: true
}];

_bluebird.default.map(options, async option => {
  let tempDir = (0, _path.resolve)(templateDir, '../');
  let targetDir = (0, _path.resolve)(tempDir, Object.keys(option).join('-'));
  console.info('option: ', option);
  const builder = new _Builder.default(Object.assign(option, {
    templateDir,
    targetDir,
    disableLock: true
  }));
  await (0, _util.exec)(`rm -rf ${targetDir}`);
  let lockPath = await (0, _index.getLockPath)(option);
  console.info('lockPath: ', lockPath);

  if (lockPath) {
    await (0, _util.exec)(`rm -rf ${lockPath}`);
  }

  await builder.run();
  await (0, _util.exec)(`cp ${(0, _path.resolve)(targetDir, 'yarn.lock')} ${lockPath}`);
  await (0, _util.exec)(`rm -rf ${targetDir}`);
}).catch(e => {
  console.warn(e);
  process.exit(1);
});
//# sourceMappingURL=generate-lock.js.map
