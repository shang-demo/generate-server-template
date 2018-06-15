import { stat, readFile, writeJSON } from 'fs-extra';
import { resolve as pathResolve } from 'path';

async function getPath() {
  // windows
  let userDataDir = process.env.APPDATA;

  if (!userDataDir) {
    // mac
    if (process.platform === 'darwin') {
      userDataDir = pathResolve(process.env.HOME, 'Library/Preferences');
    }
    // linux
    else {
      userDataDir = '/var/local';
    }
  }

  let gstPath = pathResolve(userDataDir, '.generate-server-template.json');
  return gstPath;
}

async function setConfig({ templateDir }) {
  let gstPath = await getPath();
  let gstConfig = await getConfig(gstPath);
  gstConfig.templateDir = templateDir;
  await writeJSON(gstPath, gstConfig);
  return gstConfig;
}

async function getConfig(gstPath) {
  if (!gstPath) {
    // eslint-disable-next-line no-param-reassign
    gstPath = await getPath();
  }

  let gstStr = '';
  try {
    await stat(gstPath);
    gstStr = await readFile(gstPath);
  }
  catch (e) {
    gstStr = '{}';
  }

  let gstConfig;
  try {
    gstConfig = JSON.parse(gstStr);
  }
  catch (e) {
    throw new Error(`${gstPath} is not a valid config`);
  }

  return gstConfig;
}

export { setConfig, getConfig };
