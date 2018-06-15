export default {
  '*': ['trace', 'request-infra', 'response-infra'],
  StatusController: {
    status: [],
    test: ['trace'],
  },
};
