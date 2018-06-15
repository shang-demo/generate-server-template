import Ofa2 from '@ofa2/ofa2';
import als from '@ofa2/ofa2-als';
import config from '@ofa2/ofa2-config';
import log from '@ofa2/ofa2-logger';
import model from '@ofa2/ofa2-model';
import koa from '@ofa2/ofa2-koa';
import controller from '@ofa2/ofa2-controller';
import koaPolicy from '@ofa2/ofa2-koa-policy';
import koaRoute from '@ofa2/ofa2-koa-route';
import koaServer from '@ofa2/ofa2-koa-server';
import shutdown from '@ofa2/ofa2-shutdown';
import pkg from '../package.json';

const app = new Ofa2(__dirname)
  .use(als)
  .use(config)
  .use(log)
  .use(model)
  .use(koa)
  .use(controller)
  .use(koaPolicy)
  .use(koaRoute)
  .use(koaServer)
  .use(shutdown)
  .on('lifted', () => {
    logger.info(`${pkg.name} lifted`);
    logger.info('config: ', app.config);
  })
  .on('error', e => {
    // eslint-disable-next-line no-console
    console.warn(e);
    process.exit(1);
  })
  .lift();
