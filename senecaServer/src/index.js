import Ofa2 from '@ofa2/ofa2';
import als from '@ofa2/ofa2-als';
import config from '@ofa2/ofa2-config';
import log from '@ofa2/ofa2-logger';
import seneca from '@ofa2/ofa2-seneca';
import controller from '@ofa2/ofa2-controller';
import { wrapRoutes } from '@ofa2/ofa2-seneca-wrap';
import senecaRoute from '@ofa2/ofa2-seneca-route';
import shutdown from '@ofa2/ofa2-shutdown';
import pkg from '../package.json';

const app = new Ofa2(__dirname)
  .use(als)
  .use(config)
  .use(log)
  .use(seneca)
  .use(controller)
  .use(wrapRoutes)
  .use(senecaRoute)
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
