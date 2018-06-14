import crypto from 'crypto';
import { stat } from 'fs-extra';
import { resolve as pathResolve } from 'path';

async function isExists(p) {
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

function getLockPath({
  model, koaServer, senecaClient, senecaServer, customerErrors,
}) {
  let name = getLockName([model, koaServer, senecaClient, senecaServer, customerErrors].join('|'));
  console.info('name: ', name);

  let file = pathResolve(__dirname, name);

  if (isExists(file)) {
    return file;
  }
  return null;
}

export { getLockName, getLockPath };
export default getLockPath;
