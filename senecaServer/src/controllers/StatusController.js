export default {
  async status(msg) {
    logger.info('msg: ', framework.seneca.plainMsg(msg));
    return {
      success: true,
    };
  },
};
