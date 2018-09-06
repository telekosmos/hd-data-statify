const Conflab = require('electric-conflab');
const { system: sys } = require('electrician');
const { App, Server } = require('electric-express');
const logger = require('module-tsl-logger');

const app = require('./src/app');
const pkg = require('./package.json');

const components = {
  config: new Conflab(),
  app: new App(),
  server: new Server(),
  service: app,
};

const system = sys(components);

system.start((err, ctx) => {
  if (err) {
    logger.logError(err, 'Problem starting system');
    process.exit(1);
  }

  logger.info('Started', pkg.name);

  const startTime = new Date();
  const { checks, metrics } = ctx;

});
