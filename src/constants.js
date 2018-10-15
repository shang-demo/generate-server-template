const type = 'ts';

const jsPackageRequired = ['bluebird', 'lodash', '@ofa2/ofa2', '@ofa2/ofa2-error'];

const tsPackageRequired = [
  '@babel/runtime',
  'bluebird',
  'lodash',
  '@ofa2/ofa2',
  '@ofa2/ofa2-error',
];

const packageRequired = type === 'ts' ? tsPackageRequired : jsPackageRequired;

const components = {
  error: [
    {
      src: `src/config/error.${type}`,
      value: `
  import buildError from '@ofa2/ofa2-error';
  
  global.Errors = buildError({
    UnknownError: { code: 1, message: 'unknown error, need feedback' },
  });
  `,
    },
  ],
  als: [
    {
      use: 'ofa2-als',
    },
  ],
  config: [
    {
      use: 'ofa2-config',
    },
  ],
  log: [
    {
      use: 'ofa2-logger',
      alias: 'log',
    },
    {
      src: `src/config/env/development.${type}`,
      value: {
        log: {
          level: 'trace',
          base: null,
        },
      },
    },
  ],
  model: [
    {
      use: 'ofa2-model',
    },
    {
      cp: `src/config/models.${type}`,
    },
    {
      cp: 'src/models',
    },
    {
      src: `src/config/env/development.${type}`,
      value: {
        connections: {
          mongo: {
            hosts: [{ host: '127.0.0.1', port: 27017 }],
            database: 'noName',
          },
        },
      },
    },
  ],
  koa: [
    {
      use: 'ofa2-koa',
    },
  ],
  koaController: [
    {
      use: 'ofa2-controller',
    },
    {
      cp: {
        src: 'src/controllers-koa',
        dist: 'src/controllers',
      },
    },
  ],
  koaPolicy: [
    {
      use: 'ofa2-koa-policy',
    },
    {
      cp: `src/config/policies.${type}`,
    },
    {
      cp: 'src/policies',
    },
    {
      dependencies: ['shortid'],
    },
  ],
  koaRoute: [
    {
      use: 'ofa2-koa-route',
    },
    {
      cp: {
        src: `src/config/routes-koa.${type}`,
        dist: `src/config/routes.${type}`,
      },
    },
  ],
  koaServer: [
    {
      use: 'ofa2-koa-server',
    },
  ],
  socketIO: [
    {
      use: 'ofa2-socket-io',
    },
    {
      src: `src/config/env/development.${type}`,
      value: {
        socket: {
          headerKeys: [
            {
              key: 'userId',
              header: undefined,
              required: false,
            },
          ],
          autoJoinRoom: true,
          propGet: true,
        },
      },
    },
  ],

  seneca: [
    {
      use: 'ofa2-seneca',
    },
  ],
  senecaController: [
    {
      use: 'ofa2-controller',
    },
    {
      cp: {
        src: 'src/controllers-seneca',
        dist: 'src/controllers',
      },
    },
  ],
  senecaRoute: [
    {
      use: 'ofa2-seneca-wrap-route',
    },
    {
      use: 'ofa2-seneca-route',
    },
    {
      cp: {
        src: `src/config/routes-seneca.${type}`,
        dist: `src/config/routes.${type}`,
      },
    },
  ],
  senecaWrapAct: [
    {
      use: 'ofa2-seneca-wrap-act',
    },
  ],
  senecaServer: [
    {
      src: `src/config/seneca.${type}`,
      value: {
        connection: 'rabbitmq',
        options: {
          timeout: 600000,
        },
        requestLog: 'plain',
        responseLog: true,
      },
    },
    {
      package: 'ofa2-seneca-amqp-transport',
    },
    {
      src: `src/config/env/development.${type}`,
      value: {
        connections: {
          rabbitmq: {
            transport: '@ofa2/ofa2-seneca-amqp-transport',
            options: {
              url: 'amqp://127.0.0.1',
              username: undefined,
              password: undefined,

              type: 'amqp',
              pin: 'role:template',
              consume: {
                noAck: true,
              },
            },
          },
        },
      },
    },
  ],
  senecaClient: [
    {
      use: 'ofa2-seneca-client',
    },

    {
      src: `src/config/seneca.${type}`,
      value: {
        options: {
          timeout: 600000,
        },
        client: {
          connection: 'senecaClient',
        },
      },
    },
    {
      package: '@ofa2/ofa2-seneca-amqp-transport',
    },
    {
      src: `src/config/env/development.${type}`,
      value: {
        connections: {
          senecaClient: {
            transport: '@ofa2/ofa2-seneca-amqp-transport',
            options: {
              url: 'amqp://127.0.0.1',
              username: undefined,
              password: undefined,

              type: 'amqp',
              pin: ['role:template'],
              consume: {
                noAck: true,
              },
            },
          },
        },
      },
    },
  ],
  shutdown: [
    {
      use: 'ofa2-shutdown',
    },
  ],
};

const cpDirs = [
  'config',
  `src/config/error.${type}`,
  `src/config/global.${type}`,
  `src/config/http.${type}`,
  'src/types',
  'tsconfig.json',
  '.eslintignore',
  '.nvmrc',
  '.babelrc',
  '.eslintrc.js',
  '.gitignore',
  'gulpfile.js',
  'Makefile',
];

const yjDelDirs = [
  'config/Dockerfiles',
  'config/script-tools',
  'config/remote.config.json',
  'Makefile',
];
const yjCpDirs = ['.gitignore', 'client', 'devops', 'devops.sh', 'prepare.sh'];

export { components, cpDirs, yjDelDirs, yjCpDirs, packageRequired };
export default {};
