"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseGitName = parseGitName;
exports.parseNpmName = parseNpmName;
exports.parseName = parseName;
exports.default = void 0;

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function parseNpmName(name) {
  let result = await (0, _util.exec)(`yarnpkg info ${name} --json`);
  let info = JSON.parse(result);

  if (info.error) {
    throw new Error(info.data);
  }

  return info.data.name;
}

async function parseGitName(name) {
  let arr = name.split(/#/);
  let url = `https://raw.githubusercontent.com/${arr[0]}/${arr[1] || 'master'}/package.json`;
  let body = await (0, _requestPromise.default)({
    url
  });
  let info = JSON.parse(body);
  return info.name;
}

async function parseName(name) {
  if (/^@/.test(name)) {
    return parseNpmName(name);
  } else if (/\//.test(name)) {
    return parseGitName(name);
  }

  return parseNpmName(name);
}

var _default = {
  parseGitName,
  parseNpmName,
  parseName
};
exports.default = _default;
//# sourceMappingURL=package-info-parser.js.map
