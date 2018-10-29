"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _lodash = require("lodash");

var _path = require("path");

var _prettierEslint = _interopRequireDefault(require("prettier-eslint"));

var _humps = require("humps");

var _fsExtra = require("fs-extra");

var _constants = require("./constants");

var _index = require("./yarn-lock/index");

var _packageInfoParser = require("./package-info-parser");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const type = 'ts';

function formatCode(str) {
  const options = {
    text: str,
    filePath: (0, _path.resolve)(__dirname, '../.eslintrc.js')
  };
  return (0, _prettierEslint.default)(options);
}

class Builder {
  constructor({
    model,
    koaServer,
    socketIO,
    senecaClient,
    senecaServer,
    customerErrors,
    templateDir,
    targetDir,
    yj,
    disableLock = false,
    skipInstall = false
  }) {
    Object.assign(this, {
      model,
      koaServer,
      socketIO,
      senecaClient,
      senecaServer,
      customerErrors,
      templateDir,
      targetDir,
      yj,
      disableLock,
      skipInstall
    });
    this.packageRequired = [];
    this.indexUseList = [];
    this.fileMap = {};
    this.packageRequired = _constants.packageRequired;
  }

  appendPackageRequired(name) {
    let packageName = name;

    if (/^ofa2-/.test(name)) {
      packageName = `@ofa2/${name}`;
    }

    if (this.packageRequired.indexOf(packageName) === -1) {
      this.packageRequired.push(packageName);
    }
  }

  async projectCp(src, dist = src) {
    let srcPath = (0, _path.resolve)(this.templateDir, src);
    let distPath = (0, _path.resolve)(this.targetDir, dist);
    let stats = await (0, _fsExtra.stat)(srcPath);

    if (stats.isDirectory()) {
      let {
        dir
      } = await (0, _path.parse)(distPath);
      await (0, _fsExtra.ensureDir)(dir);
      await (0, _util.exec)(`cp -r ${srcPath} ${distPath}`);
    } else if (stats.isFile()) {
      await (0, _fsExtra.ensureFile)(distPath);
      await (0, _util.exec)(`cp ${srcPath} ${distPath}`);
    }

    return null;
  }

  async createComponent(name) {
    let configurations = _constants.components[name];
    configurations.map(config => {
      if (config.use) {
        this.indexUseList.push(config);
        this.appendPackageRequired(config.use);
        return null;
      }

      if (config.cp) {
        if (config.cp.src) {
          return this.projectCp(config.cp.src, config.cp.dist);
        }

        return this.projectCp(config.cp);
      }

      if (config.src && config.value) {
        if (typeof config.value === 'string') {
          this.fileMap[config.src] = this.fileMap[config.src] || '';
          this.fileMap[config.src] = `${this.fileMap[config.src]}\n${config.value}`;
          return null;
        }

        this.fileMap[config.src] = this.fileMap[config.src] || {};
        this.fileMap[config.src] = (0, _lodash.merge)(this.fileMap[config.src], config.value);
        return null;
      }

      if (config.package) {
        this.appendPackageRequired(config.package);
        return null;
      }

      if (config.dependencies) {
        this.packageRequired.push(...config.dependencies);
        return null;
      }

      return null;
    });
  }

  async createPackageJson() {
    let {
      name
    } = (0, _path.parse)(this.targetDir);
    let pkg = await (0, _fsExtra.readJson)((0, _path.resolve)(this.templateDir, 'package.json'));
    pkg.name = name;
    pkg.dependencies = {};

    if (this.yj) {
      delete pkg.devDependencies['@s4p/eslint-config'];
      pkg.devDependencies['@ofa2/eslint-config-ofa2'] = '^1.0.0';
    }

    let p = (0, _path.resolve)(this.targetDir, 'package.json');
    await (0, _fsExtra.writeFile)(p, JSON.stringify(pkg, null, 2));
  }

  async buildPackage() {
    await this.createPackageJson();
    let {
      lockPath,
      isExists
    } = await (0, _index.getLockPath)(this);

    if (!this.disableLock && isExists) {
      await (0, _util.exec)(`cp ${lockPath} ${(0, _path.resolve)(this.targetDir, 'yarn.lock')}`);
    }

    let cmd = `cd ${this.targetDir} && yarnpkg add ${this.packageRequired.join(' ')}`;

    if (this.skipInstall) {
      return cmd.replace(/.*?&& yarnpkg add/, 'yarnpkg add');
    }

    await (0, _util.exec)(cmd);
    return null;
  }

  async cpBase() {
    await _bluebird.default.all(_constants.cpDirs.map(src => {
      return this.projectCp(src);
    }));
  }

  async ensureTargetDir() {
    await (0, _fsExtra.ensureDir)(this.targetDir);
  }

  async buildComponents() {
    let requiredComponents = ['als', 'config', 'log'];

    if (this.customerErrors) {
      let packageName = await (0, _packageInfoParser.parseName)(this.customerErrors);
      _constants.components.error = [{
        src: `src/config/error.${type}`,
        value: `
    import buildError from '@ofa2/ofa2-error';
    import errors from '${packageName}';

    errors.UnknownError = 'unknown error, need feedback';
    errors.ParamsRequired = 'params required';

    global.Errors = buildError(errors);
    `
      }, {
        dependencies: [this.customerErrors]
      }];
      requiredComponents.push('error');
    } // mongoose model


    if (this.model) {
      requiredComponents.push(...['model']);
    }

    if (this.koaServer) {
      requiredComponents.push(...['koa', 'koaController', 'koaPolicy', 'koaRoute', 'koaServer']);
    }

    if (this.socketIO) {
      requiredComponents.push(...['socketIO']);
    }

    if (this.senecaClient) {
      requiredComponents.push(...['seneca', 'senecaClient', 'senecaWrapAct']);
    }

    if (this.senecaServer) {
      // senecaClient may had add seneca
      if (requiredComponents.indexOf('seneca') === -1) {
        requiredComponents.push('seneca');
      }

      requiredComponents.push(...['senecaController', 'senecaRoute', 'senecaServer']);
    }

    requiredComponents.push(...['shutdown']);
    await _bluebird.default.all(requiredComponents.map(key => {
      return this.createComponent(key);
    }));
  }

  async buildConfigFile() {
    await _bluebird.default.all(Object.keys(this.fileMap).map(async key => {
      let str = '';

      if (typeof this.fileMap[key] === 'string') {
        str = this.fileMap[key];
      } else {
        str = `export default\n${JSON.stringify(this.fileMap[key], null, 2)}`;
      }

      let p = (0, _path.resolve)(this.targetDir, key);
      await (0, _fsExtra.ensureFile)(p);
      (0, _fsExtra.writeFile)(p, formatCode(str));
    }));
  }

  async buildIndexJs() {
    let str = `
  import Ofa2 from '@ofa2/ofa2';
  `;
    this.indexUseList.forEach(item => {
      if (/^ofa2/.test(item.use)) {
        item.use = `@ofa2/${item.use}`;
      }

      if (item.alias) {
        return;
      }

      item.alias = (0, _humps.camelize)(item.use.replace(/^@ofa2\/ofa2/, ''));
    });
    this.indexUseList.forEach(item => {
      str += `import ${item.alias} from '${item.use}';`;
    });
    str += `
  import pkg from '../package.json';

  const app = new Ofa2(__dirname)
  `;
    this.indexUseList.forEach(item => {
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
    await (0, _fsExtra.writeFile)((0, _path.resolve)(this.targetDir, `src/index.${type}`), formatCode(str));
  }

  async buildYJ() {
    if (!this.yj) {
      return null;
    }

    await _bluebird.default.all(_constants.yjDelDirs.map(dir => {
      return (0, _util.exec)(`cd ${this.targetDir} && rm -rf ${dir}`);
    }));
    await (0, _util.exec)(`cd ${this.targetDir} && mkdir -p server && ls -A | grep -v server | xargs -I {} mv {} server`);
    await _bluebird.default.all(_constants.yjCpDirs.map(dir => {
      let cpPath = (0, _path.resolve)(this.yj, dir);
      return (0, _util.exec)(`cp -rf ${cpPath} ${this.targetDir}`);
    }));
    return null;
  }

  async run() {
    await this.ensureTargetDir();
    await this.cpBase();
    await this.buildComponents();
    await this.buildConfigFile();
    await this.buildIndexJs();
    let echoText = await this.buildPackage();
    await this.buildYJ();

    if (echoText) {
      console.info('====== you need run next cmd =======');
      console.info(echoText);
    }
  }

}

var _default = Builder;
exports.default = _default;
//# sourceMappingURL=Builder.js.map
