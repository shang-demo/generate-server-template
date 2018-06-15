"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLockName = getLockName;
exports.getLockPath = getLockPath;
exports.default = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _fsExtra = require("fs-extra");

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function checkExists(p) {
  try {
    await (0, _fsExtra.stat)(p);
    return true;
  } catch (e) {
    return false;
  }
}

function getLockName(str) {
  const hash = _crypto.default.createHash('sha256');

  hash.update(str);
  return hash.digest('hex');
}

async function getLockPath({
  model,
  koaServer,
  senecaClient,
  senecaServer,
  customerErrors
}) {
  let name = getLockName([model, koaServer, senecaClient, senecaServer, customerErrors].join('|'));
  console.info('lock file name: ', name);
  let file = (0, _path.resolve)(__dirname, name);
  let isExists = await checkExists(file);

  if (isExists) {
    return file;
  }

  return null;
}

var _default = getLockPath;
exports.default = _default;
//# sourceMappingURL=index.js.map
