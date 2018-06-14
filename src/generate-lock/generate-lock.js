import Promise from 'bluebird';
import { resolve as pathResolve } from 'path';
import { exec, cp } from 'shelljs';
import { getLockPath } from '../yarn-lock/index';

import {
  ensureTargetDir,
  cpBase,
  buildComponents,
  buildConfigFile,
  buildIndexJs,
  buildPackage,
} from '../build';

const tempDir = pathResolve(__dirname, '../../dist');

let options = [
  { koaServer: true },
  { koaServer: true, senecaClient: true },
  { senecaServer: true },
  // same as {senecaServer: true}
  // { senecaServer: true, senecaClient: true },
  { koaServer: true, model: true },
  { koaServer: true, senecaClient: true, model: true },
  { senecaServer: true, model: true },
  // same as {senecaServer: true}
  // { senecaServer: true, model: true },
];
let arr = [ensureTargetDir, cpBase, buildComponents, buildConfigFile, buildIndexJs];

// must be each, because build use same memory
Promise.each(options, async (option) => {
  console.info('option: ', option);

  let targetDir = pathResolve(tempDir, Object.keys(option).join('-'));
  await exec(`rm -rf ${targetDir}`);
  try {
    await Promise.each(arr, (fun) => {
      return fun(targetDir, option);
    });

    let lockPath = await getLockPath(option);
    console.info('lockPath: ', lockPath);
    if (lockPath) {
      await exec(`rm -rf ${lockPath}`);
    }

    await buildPackage(targetDir);
    await cp(pathResolve(targetDir, 'yarn.lock'), lockPath);
  }
  catch (e) {
    console.warn(e);
  }
  await exec(`rm -rf ${targetDir}`);
});
