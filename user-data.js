"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setConfig = setConfig;
exports.getConfig = getConfig;

var _fsExtra = require("fs-extra");

var _path = require("path");

async function getPath() {
  // windows
  let userDataDir = process.env.APPDATA;

  if (!userDataDir) {
    // mac
    if (process.platform === 'darwin') {
      userDataDir = (0, _path.resolve)(process.env.HOME, 'Library/Preferences');
    } // linux
    else {
        userDataDir = '/var/local';
      }
  }

  let gstPath = (0, _path.resolve)(userDataDir, '.generate-server-template.json');
  return gstPath;
}

async function setConfig({
  templateDir
}) {
  let gstPath = await getPath();
  let gstConfig = await getConfig(gstPath);
  gstConfig.templateDir = templateDir;
  await (0, _fsExtra.writeJSON)(gstPath, gstConfig);
  return gstConfig;
}

async function getConfig(gstPath) {
  if (!gstPath) {
    // eslint-disable-next-line no-param-reassign
    gstPath = await getPath();
  }

  let gstStr = '';

  try {
    await (0, _fsExtra.stat)(gstPath);
    gstStr = await (0, _fsExtra.readFile)(gstPath);
  } catch (e) {
    gstStr = '{}';
  }

  let gstConfig;

  try {
    gstConfig = JSON.parse(gstStr);
  } catch (e) {
    throw new Error(`${gstPath} is not a valid config`);
  }

  return gstConfig;
}
//# sourceMappingURL=user-data.js.map
