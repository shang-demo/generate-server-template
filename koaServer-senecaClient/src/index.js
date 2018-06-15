import Ofa2 from '@ofa2/ofa2';
import als from '@ofa2/ofa2-als';
import config from '@ofa2/ofa2-config';
import log from '@ofa2/ofa2-logger';
import koa from '@ofa2/ofa2-koa';
import controller from '@ofa2/ofa2-controller';
import koaPolicy from '@ofa2/ofa2-koa-policy';
import koaRoute from '@ofa2/ofa2-koa-route';
import koaServer from '@ofa2/ofa2-koa-server';
import seneca from '@ofa2/ofa2-seneca';
import senecaClient from '@ofa2/ofa2-seneca-client';
import { wrapAct } from '@ofa2/ofa2-seneca-wrap';
import shutdown from '@ofa2/ofa2-shutdown';
import pkg from '../package.json';

const app = new Ofa2(__dirname)
  .use(als)
  .use(config)
  .use(log)
  .use(koa)
  .use(controller)
  .use(koaPolicy)
  .use(koaRoute)
  .use(koaServer)
  .use(seneca)
  .use(senecaClient)
  .use(wrapAct)
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
