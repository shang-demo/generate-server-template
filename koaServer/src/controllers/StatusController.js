export default {
  async status() {
    return {
      success: true,
    };
  },
  test(ctx) {
    let { body } = ctx.request;
    logger.info('body: ', body);
    throw new Errors.UnknownError({
      msg: 'test',
    });
  },
};
