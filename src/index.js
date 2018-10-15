import program from 'commander';
import { stat } from 'fs-extra';
import { resolve as pathResolve } from 'path';
import { prompt } from 'inquirer';

import { colorEcho } from './util';
import { getConfig, setConfig } from './user-data';
import Builder from './Builder';

async function parseArgv() {
  let targetDir;

  program
    .version('0.0.1', '-v, --version')
    .arguments('<target>')
    .option('--setTemplateDir <set template dir>', 'set template dir persistence')
    .option('-t --templateDir <template dir>', 'set template dir')
    .option('-k --koaServer', 'add koa server')
    .option('-i --socketIO', 'add socket io server')
    .option('-c --senecaClient', 'add seneca client')
    .option('-s --senecaServer', 'add seneca server')
    .option('-m --model', 'add model')
    .option('-e --customerErrors <error-package>', 'add customer errors package')
    .option('--yj <cloudnapps-template-dir>', 'build for cloudnapps')
    .option('--si', 'skip yarn install')
    .action((target) => {
      targetDir = target;
    })
    .parse(process.argv);

  let {
    model,
    koaServer,
    socketIO,
    senecaClient,
    senecaServer,
    customerErrors,
    templateDir,
    setTemplateDir,
    yj,
    si,
  } = program;

  if (setTemplateDir) {
    try {
      let gsConfig = await setConfig({ templateDir: setTemplateDir });
      colorEcho(JSON.stringify(gsConfig));
    }
    catch (e) {
      colorEcho(e.message);
      process.exit(1);
    }
    process.exit(0);
  }

  if (!templateDir) {
    ({ templateDir } = await getConfig());
  }

  if (!templateDir) {
    colorEcho(' gs -t <use templateDir> or gs --setTemplateDir <set template dir>');
    process.exit(1);
  }

  // must be a type to generate
  if (!koaServer && !senecaClient && !senecaServer) {
    koaServer = true;
  }

  // socketIO must with koaServer
  if (socketIO && !koaServer) {
    colorEcho('socketIo need koaServer; `gs -ki`');
    process.exit(1);
  }

  if (koaServer && senecaServer) {
    colorEcho('koa server or seneca server should be only');
    process.exit(1);
  }

  // resolve target dir
  if (!targetDir) {
    colorEcho('no target dir given!');
    process.exit(1);
  }
  else if (!/^\//.test(targetDir)) {
    targetDir = pathResolve(process.cwd(), targetDir);
  }

  let targetDirIsExists = false;
  try {
    await stat(targetDir);
    targetDirIsExists = true;
  }
  catch (e) {
    targetDirIsExists = false;
  }

  if (targetDirIsExists) {
    let { confirm } = await prompt({
      type: 'confirm',
      name: 'confirm',
      message: `${targetDir} is exists, cover it?`,
      default: false,
    });

    if (!confirm) {
      colorEcho(`${targetDir} exists`);
      process.exit(1);
    }
  }

  let info = {
    targetDir,
    templateDir,
    model,
    koaServer,
    socketIO,
    senecaClient,
    senecaServer,
    customerErrors,
    yj,
    skipInstall: si,
  };

  let message = '';
  Object.keys(info).forEach((key) => {
    if (info[key]) {
      message = `${message}${key}: ${info[key]}\n  `;
    }
  });

  let { confirm } = await prompt({
    type: 'confirm',
    name: 'confirm',
    message,
    default: true,
  });

  if (!confirm) {
    process.exit(1);
  }

  return info;
}

(async () => {
  let result = await parseArgv();
  let builder = new Builder(result);
  await builder.run();
})();
