export default {
  log: {
    level: 'trace',
    base: null,
  },
  connections: {
    mongo: {
      hosts: [
        {
          host: '127.0.0.1',
          port: 27017,
        },
      ],
      database: 'noName',
    },
    rabbitmq: {
      transport: '@ofa2/ofa2-seneca-amqp-transport',
      options: {
        url: 'amqp://127.0.0.1',
        type: 'amqp',
        pin: 'role:template',
        consume: {
          noAck: true,
        },
      },
    },
  },
};
