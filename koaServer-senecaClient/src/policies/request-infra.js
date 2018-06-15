export default async function (ctx, next) {
  if (['POST', 'UPDATE', 'GET'].indexOf(ctx.method) === -1) {
    await next();
    return;
  }

  let logs = [`${ctx.method} ${ctx.url} -- query:`, ctx.request.query || {}];
  if (ctx.method === 'POST' || ctx.method === 'UPDATE') {
    logs.push('--- body:');
    logs.push(ctx.request.body || {});
  }
  logger.info(...logs);
  await next();
}
