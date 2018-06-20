import Promise from 'bluebird';
import { resolve as pathResolve } from 'path';
import { exec } from './util';
import { getLockPath } from './yarn-lock/index';

import Builder from './Builder';

const templateDir = process.env.TEMPLATE_DIR;
console.info('templateDir: ', templateDir);

let options = [
  { koaServer: true },
  { koaServer: true, senecaClient: true },
  { senecaServer: true },
  { senecaServer: true, senecaClient: true },
  { koaServer: true, model: true },
  { koaServer: true, senecaClient: true, model: true },
  { senecaServer: true, model: true },
  { senecaServer: true, senecaClient: true, model: true },
];

Promise.map(options, async (option) => {
  let tempDir = pathResolve(templateDir, '../');
  let targetDir = pathResolve(tempDir, Object.keys(option).join('-'));

  console.info('option: ', option);
  const builder = new Builder(Object.assign(option, {
    templateDir,
    targetDir,
    disableLock: true,
  }));

  await exec(`rm -rf ${targetDir}`);
  let { lockPath, isExists } = await getLockPath(option);
  console.info('lockPath: ', lockPath);
  if (isExists) {
    await exec(`rm -rf ${lockPath}`);
  }

  await builder.run();
  await exec(`cp ${pathResolve(targetDir, 'yarn.lock')} ${lockPath}`);
  await exec(`rm -rf ${targetDir}`);
}).catch((e) => {
  console.warn(e);
  process.exit(1);
});
