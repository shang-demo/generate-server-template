import Promise from 'bluebird';
import { merge } from 'lodash';
import { spawn } from 'child_process';
import { resolve as pathResolve, parse as pathParse } from 'path';
import format from 'prettier-eslint';
import { camelize } from 'humps';
import { writeFile, readJson, ensureFile, ensureDir, stat } from 'fs-extra';
import { components, cpDirs } from './constants';
import { getLockPath } from './yarn-lock/index';
import { parseName } from './package-info-parser';

function exec(cmd, opt = {}) {
  console.info(cmd);
  return new Promise((resolve, reject) => {
    let child = spawn(
      cmd,
      Object.assign(
        {
          shell: true,
          stdio: 'inherit',
        },
        opt
      )
    );

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      }
      reject(code);
    });
  });
}

function formatCode(str) {
  const options = {
    text: str,
    filePath: pathResolve(__dirname, '../.eslintrc.js'),
  };

  return format(options);
}

class Builder {
  constructor({
    model,
    koaServer,
    senecaClient,
    senecaServer,
    customerErrors,
    templateDir,
    targetDir,
    disableLock = false,
  }) {
    Object.assign(this, {
      model,
      koaServer,
      senecaClient,
      senecaServer,
      customerErrors,
      templateDir,
      targetDir,
      disableLock,
    });

    this.packageRequired = [];
    this.indexUseList = [];
    this.fileMap = {};
    this.packageRequired = ['bluebird', 'lodash', '@ofa2/ofa2', '@ofa2/ofa2-error'];
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
    let srcPath = pathResolve(this.templateDir, src);
    let distPath = pathResolve(this.targetDir, dist);

    let stats = await stat(srcPath);
    if (stats.isDirectory()) {
      let { dir } = await pathParse(distPath);
      await ensureDir(dir);
      await exec(`cp -r ${srcPath} ${distPath}`);
    }
    else if (stats.isFile()) {
      await ensureFile(distPath);
      await exec(`cp ${srcPath} ${distPath}`);
    }
    return null;
  }

  async createComponent(name) {
    let configurations = components[name];

    configurations.map((config) => {
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
        this.fileMap[config.src] = merge(this.fileMap[config.src], config.value);
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
    let { name } = pathParse(this.targetDir);
    let pkg = await readJson(pathResolve(this.templateDir, 'package.json'));
    pkg.name = name;
    pkg.dependencies = {};

    let p = pathResolve(this.targetDir, 'package.json');
    await writeFile(p, JSON.stringify(pkg, null, 2));
  }

  async buildPackage() {
    await this.createPackageJson();
    let lockPath = await getLockPath(this);
    if (!this.disableLock && lockPath) {
      await exec(`cp ${lockPath} ${pathResolve(this.targetDir, 'yarn.lock')}`);
    }

    let cmd = `cd ${this.targetDir} && yarnpkg add ${this.packageRequired.join(' ')}`;
    console.log(cmd);
    await exec(cmd);
  }

  async cpBase() {
    await Promise.all(cpDirs.map((src) => {
      return this.projectCp(src);
    }));
  }

  async ensureTargetDir() {
    await ensureDir(this.targetDir);
  }

  async buildComponents() {
    let requiredComponents = ['als', 'config', 'log'];

    if (this.customerErrors) {
      let packageName = await parseName(this.customerErrors);
      components.error = [
        {
          src: 'src/config/error.js',
          value: `
    import buildError from '@ofa2/ofa2-error';
    import errors from '${packageName}';
    
    global.Errors = buildError(errors);
    `,
        },
        {
          dependencies: [this.customerErrors],
        },
      ];
      requiredComponents.push('error');
    }

    // mongoose model
    if (this.model) {
      requiredComponents.push(...['model']);
    }

    if (this.koaServer) {
      requiredComponents.push(...['koa', 'koaController', 'koaPolicy', 'koaRoute', 'koaServer']);
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

    await Promise.all(requiredComponents.map((key) => {
      return this.createComponent(key);
    }));
  }

  async buildConfigFile() {
    await Promise.all(Object.keys(this.fileMap).map(async (key) => {
      let str = '';

      if (typeof this.fileMap[key] === 'string') {
        str = this.fileMap[key];
      }
      else {
        str = `export default\n${JSON.stringify(this.fileMap[key], null, 2)}`;
      }

      let p = pathResolve(this.targetDir, key);
      await ensureFile(p);
      writeFile(p, formatCode(str));
    }));
  }

  async buildIndexJs() {
    let str = `
  import Ofa2 from '@ofa2/ofa2';
  `;

    this.indexUseList.forEach((item) => {
      if (/^ofa2/.test(item.use)) {
        item.use = `@ofa2/${item.use}`;
      }

      if (item.alias) {
        return;
      }

      item.alias = camelize(item.use.replace(/^@ofa2\/ofa2/, ''));
    });

    this.indexUseList.forEach((item) => {
      str += `import ${item.alias} from '${item.use}';`;
    });
    str += `
  import pkg from '../package.json';

  const app = new Ofa2(__dirname)
  `;
    this.indexUseList.forEach((item) => {
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

    await writeFile(pathResolve(this.targetDir, 'src/index.js'), formatCode(str));
  }

  async run() {
    await this.ensureTargetDir();
    await this.cpBase();
    await this.buildComponents();
    await this.buildConfigFile();
    await this.buildIndexJs();
    await this.buildPackage();
  }
}

export default Builder;