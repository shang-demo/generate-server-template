import crypto from 'crypto';
import { stat } from 'fs-extra';
import { resolve as pathResolve } from 'path';

async function checkExists(p) {
  try {
    await stat(p);
    return true;
  }
  catch (e) {
    return false;
  }
}

function getLockName(str) {
  const hash = crypto.createHash('sha256');
  hash.update(str);
  return hash.digest('hex');
}

async function getLockPath({
  model, koaServer, senecaClient, senecaServer, customerErrors,
}) {
  let name = getLockName([model, koaServer, senecaClient, senecaServer, customerErrors].join('|'));
  console.info('lock file name: ', name);

  let file = pathResolve(__dirname, name);
  let isExists = await checkExists(file);

  return {
    lockPath: file,
    isExists,
  };
}

export { getLockName, getLockPath };
export default getLockPath;
