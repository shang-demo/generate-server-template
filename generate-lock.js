"use strict";

var _bluebird = _interopRequireDefault(require("bluebird"));

var _path = require("path");

var _shelljs = require("shelljs");

var _index = require("./yarn-lock/index");

var _Builder = _interopRequireDefault(require("./Builder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const templateDir = process.env.TEMPLATE_DIR;
console.info('templateDir: ', templateDir);
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

_bluebird.default.map(options, async option => {
  let tempDir = (0, _path.resolve)(__dirname, '../dist');
  let targetDir = (0, _path.resolve)(tempDir, Object.keys(option).join('-'));
  console.info('option: ', option);
  const builder = new _Builder.default(Object.assign(option, {
    templateDir,
    targetDir,
    disableLock: true
  }));
  await (0, _shelljs.exec)(`rm -rf ${targetDir}`);
  let lockPath = await (0, _index.getLockPath)(option);
  console.info('lockPath: ', lockPath);

  if (lockPath) {
    await (0, _shelljs.exec)(`rm -rf ${lockPath}`);
  }

  await builder.run();
}).catch(e => {
  console.warn(e);
  process.exit(1);
});
//# sourceMappingURL=generate-lock.js.map
