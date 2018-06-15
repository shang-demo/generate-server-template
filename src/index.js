import Promise from 'bluebird';
import program from 'commander';
import { stat } from 'fs-extra';
import { resolve as pathResolve } from 'path';
import { prompt } from 'inquirer';

import { colorEcho } from './util';
import { getConfig, setConfig } from './user-data';
import {
  ensureTargetDir,
  cpBase,
  buildComponents,
  buildConfigFile,
  buildIndexJs,
  buildPackage,
} from './build';

async function parseArgv() {
  let targetDir;

  program
    .version('0.0.1', '-v, --version')
    .arguments('<target>')
    .option('-t --templateDir <template dir>', 'set template dir')
    .option('-k --koaServer', 'add koa server')
    .option('-c --senecaClient', 'add seneca client')
    .option('-s --senecaServer', 'add seneca server')
    .option('-m --model', 'add model')
    .option('-e --customerErrors <error-package>', 'add customer errors package')
    .action((target) => {
      targetDir = target;
    })
    .parse(process.argv);

  if (program.templateDir) {
    try {
      let gstConfig = await setConfig({ templateDir: program.templateDir });
      colorEcho(JSON.stringify(gstConfig));
    }
    catch (e) {
      colorEcho(e.message);
      process.exit(1);
    }
    process.exit(0);
  }

  let { templateDir } = await getConfig();

  if (!templateDir) {
    colorEcho('gst -t <template dir> to set template dir');
    process.exit(1);
  }

  // must be a type to generate
  if (!program.koaServer && !program.senecaClient && !program.senecaServer) {
    program.koaServer = true;
  }

  if (program.koaServer && program.senecaServer) {
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
    dir: targetDir,
    model: program.model,
    koaServer: program.koaServer,
    senecaClient: program.senecaClient,
    senecaServer: program.senecaServer,
    customerErrors: program.customerErrors,
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

  return targetDir;
}

(async () => {
  let targetDir = await parseArgv();

  let arr = [ensureTargetDir, cpBase, buildComponents, buildConfigFile, buildIndexJs, buildPackage];

  let {
    model, koaServer, senecaClient, senecaServer, customerErrors,
  } = program;

  await Promise.each(arr, (fun) => {
    return fun(targetDir, {
      model,
      koaServer,
      senecaClient,
      senecaServer,
      customerErrors,
    });
  });
})();
