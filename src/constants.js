const components = {
  error: [
    {
      src: 'src/config/error.js',
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
      src: 'src/config/env/development.js',
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
      cp: 'src/config/models.js',
    },
    {
      cp: 'src/models',
    },
    {
      src: 'src/config/env/development.js',
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
      cp: 'src/config/policies.js',
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
        src: 'src/config/routes-koa.js',
        dist: 'src/config/routes.js',
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
      src: 'src/config/env/development.js',
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
        src: 'src/config/routes-seneca.js',
        dist: 'src/config/routes.js',
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
      src: 'src/config/seneca.js',
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
      src: 'src/config/env/development.js',
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
      src: 'src/config/seneca.js',
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
      src: 'src/config/env/development.js',
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
  'src/config/error.js',
  'src/config/global.js',
  'src/config/http.js',
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
  'Makefile'
];
const yjCpDirs = [
  '.gitignore',
  'client',
  'devops',
  'devops.sh',
  'prepare.sh',
];

export { components, cpDirs, yjDelDirs, yjCpDirs };
export default {};
