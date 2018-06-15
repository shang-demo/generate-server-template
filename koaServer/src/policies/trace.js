import shortId from 'shortid';

export default async function (ctx, next) {
  let traceId = ctx.get('x-trace-id') || shortId();
  if (global.als) {
    global.als.set('traceId', traceId);
  }
  ctx.set('x-trace-id', traceId);
  await next();
}
