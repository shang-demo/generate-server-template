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
  },
};
