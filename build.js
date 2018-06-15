"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureTargetDir = ensureTargetDir;
exports.cpBase = cpBase;
exports.buildComponents = buildComponents;
exports.buildConfigFile = buildConfigFile;
exports.buildIndexJs = buildIndexJs;
exports.buildPackage = buildPackage;
exports.getPackageRequired = getPackageRequired;
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _lodash = require("lodash");

var _shelljs = require("shelljs");

var _path = require("path");

var _prettierEslint = _interopRequireDefault(require("prettier-eslint"));

var _humps = require("humps");

var _fsExtra = require("fs-extra");

var _constants = require("./constants");

var _index = require("./yarn-lock/index");

var _packageInfoParser = require("./package-info-parser");

var _userData = require("./user-data");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const indexUseList = [];
const fileMap = {};
const packageRequired = ['bluebird', 'lodash', '@ofa2/ofa2', '@ofa2/ofa2-error'];

async function ensureDir(p) {
  let {
    dir
  } = (0, _path.parse)(p);
  (0, _shelljs.mkdir)('-p', dir);
}

async function ensureFile(p) {
  await ensureDir(p);
  (0, _shelljs.touch)(p);
}

async function projectCp(targetDir, src, dist = src) {
  let {
    templateDir
  } = await (0, _userData.getConfig)();
  let srcPath = (0, _path.resolve)(templateDir, src);
  let distPath = (0, _path.resolve)(targetDir, dist);
  await ensureDir(distPath); // console.info(`cp -r ${srcPath}, ${distPath}`);

  return (0, _shelljs.cp)('-r', srcPath, distPath);
}

function appendPackageRequired(name) {
  let packageName = name;

  if (/^ofa2-/.test(name)) {
    packageName = `@ofa2/${name}`;
  }

  if (packageRequired.indexOf(packageName) === -1) {
    packageRequired.push(packageName);
  }
}

async function createComponent(targetDir, name) {
  let configurations = _constants.components[name];
  configurations.map(config => {
    if (config.use) {
      indexUseList.push(config);
      appendPackageRequired(config.use);
      return null;
    }

    if (config.cp) {
      if (config.cp.src) {
        return projectCp(targetDir, config.cp.src, config.cp.dist);
      }

      return projectCp(targetDir, config.cp);
    }

    if (config.src && config.value) {
      if (typeof config.value === 'string') {
        fileMap[config.src] = fileMap[config.src] || '';
        fileMap[config.src] = `${fileMap[config.src]}\n${config.value}`;
        return null;
      }

      fileMap[config.src] = fileMap[config.src] || {};
      fileMap[config.src] = (0, _lodash.merge)(fileMap[config.src], config.value);
      return null;
    }

    if (config.package) {
      appendPackageRequired(config.package);
      return null;
    }

    if (config.dependencies) {
      packageRequired.push(...config.dependencies);
      return null;
    }

    return null;
  });
}

async function createPackageJson(targetDir) {
  let {
    name
  } = (0, _path.parse)(targetDir);
  let {
    templateDir
  } = await (0, _userData.getConfig)();
  let pkgStr = await (0, _fsExtra.readFile)((0, _path.resolve)(templateDir, 'package.json'));
  let pkg = JSON.parse(pkgStr);
  pkg.name = name;
  pkg.dependencies = {};
  let p = (0, _path.resolve)(targetDir, 'package.json');
  await ensureFile(p);
  await (0, _fsExtra.writeFile)(p, JSON.stringify(pkg, null, 2));
}

function formatCode(str) {
  const options = {
    text: str,
    filePath: (0, _path.resolve)(__dirname, '../.eslintrc.js')
  };
  return (0, _prettierEslint.default)(options);
}

async function getPackageRequired() {
  packageRequired.sort();
  return packageRequired;
}

async function buildPackage(targetDir, {
  model,
  koaServer,
  senecaClient,
  senecaServer,
  customerErrors
}) {
  await createPackageJson(targetDir);
  let lockPath = await (0, _index.getLockPath)({
    model,
    koaServer,
    senecaClient,
    senecaServer,
    customerErrors
  });

  if (lockPath) {
    (0, _shelljs.cp)(lockPath, (0, _path.resolve)(targetDir, 'yarn.lock'));
  }

  let cmd = `cd ${targetDir} && yarnpkg add ${packageRequired.join(' ')}`;
  console.log(cmd);
  await (0, _shelljs.exec)(cmd);
}

async function cpBase(targetDir) {
  // copy dirs
  await _bluebird.default.all(_constants.cpDirs.map(src => {
    return projectCp(targetDir, src);
  }));
}

async function ensureTargetDir(targetDir) {
  await (0, _shelljs.exec)(`mkdir -p ${targetDir}`);
}

async function buildComponents(targetDir, {
  model,
  koaServer,
  senecaClient,
  senecaServer,
  customerErrors
}) {
  let requiredComponents = ['als', 'config', 'log'];

  if (customerErrors) {
    let packageName = await (0, _packageInfoParser.parseName)(customerErrors);
    _constants.components.error = [{
      src: 'src/config/error.js',
      value: `
    import buildError from '@ofa2/ofa2-error';
    import errors from '${packageName}';
    
    global.Errors = buildError(errors);
    `
    }, {
      dependencies: [customerErrors]
    }];
    requiredComponents.push('error');
  } // mongoose model


  if (model) {
    requiredComponents.push(...['model']);
  }

  if (koaServer) {
    requiredComponents.push(...['koa', 'koaController', 'koaPolicy', 'koaRoute', 'koaServer']);
  }

  if (senecaClient) {
    requiredComponents.push(...['seneca', 'senecaClient', 'senecaWrapAct']);
  }

  if (senecaServer) {
    // senecaClient may had add seneca
    if (requiredComponents.indexOf('seneca') === -1) {
      requiredComponents.push('seneca');
    }

    requiredComponents.push(...['senecaController', 'senecaRoute', 'senecaServer']);
  }

  requiredComponents.push(...['shutdown']);
  await _bluebird.default.all(requiredComponents.map(key => {
    return createComponent(targetDir, key);
  }));
}

async function buildConfigFile(targetDir) {
  await _bluebird.default.all(Object.keys(fileMap).map(async key => {
    let str = '';

    if (typeof fileMap[key] === 'string') {
      str = fileMap[key];
    } else {
      str = `export default\n${JSON.stringify(fileMap[key], null, 2)}`;
    }

    let p = (0, _path.resolve)(targetDir, key);
    await ensureFile(p);
    (0, _fsExtra.writeFile)(p, formatCode(str));
  }));
}

async function buildIndexJs(targetDir) {
  let str = `
  import Ofa2 from '@ofa2/ofa2';
  `;
  indexUseList.forEach(item => {
    if (/^ofa2/.test(item.use)) {
      item.use = `@ofa2/${item.use}`;
    }

    if (item.alias) {
      return;
    }

    item.alias = (0, _humps.camelize)(item.use.replace(/^@ofa2\/ofa2/, ''));
  });
  indexUseList.forEach(item => {
    str += `import ${item.alias} from '${item.use}';`;
  });
  str += `
  import pkg from '../package.json';

  const app = new Ofa2(__dirname)
  `;
  indexUseList.forEach(item => {
    str += `.use(${item.useName || item.alias})`;
  });
  str += `
  .on('lifted', () => {
    logger.info(\`\${pkg.name} lifted\`);
    logger.info('config: ', app.config);
  })
  .on('error', (e) => {
    // eslint-disable-next-line no-console
    console.warn(e);
    process.exit(1);
  })
  .lift();
  `;
  await (0, _fsExtra.writeFile)((0, _path.resolve)(targetDir, 'src/index.js'), formatCode(str));
}

var _default = {
  ensureTargetDir,
  cpBase,
  buildComponents,
  buildConfigFile,
  buildIndexJs,
  buildPackage,
  getPackageRequired
};
exports.default = _default;
//# sourceMappingURL=build.js.map
