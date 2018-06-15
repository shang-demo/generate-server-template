const showBody = false;

export default async function (ctx, next) {
  const start = Date.now();
  let logs = [];

  await next();

  let ms = Date.now() - start;
  logs.push(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);

  if (showBody) {
    logs.push('---');
    // eslint-disable-next-line no-underscore-dangle
    if (ctx.body && ctx.body._readableState) {
      logs.push('response send buffer');
    }
    else {
      logs.push(ctx.body || '');
    }
  }

  logger.info(...logs);
}
