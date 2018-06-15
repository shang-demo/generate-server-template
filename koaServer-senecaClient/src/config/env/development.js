export default {
  log: {
    level: 'trace',
    base: null,
  },
  connections: {
    senecaClient: {
      transport: '@ofa2/ofa2-seneca-amqp-transport',
      options: {
        url: 'amqp://127.0.0.1',
        type: 'amqp',
        pin: ['role:template'],
        consume: {
          noAck: true,
        },
      },
    },
  },
};
