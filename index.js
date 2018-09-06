const Conflab = require('electric-conflab');
const { system: sys } = require('electrician');
const logger = require('module-tsl-logger');

const components = {
  config: new Conflab(),
};

const system = sys(components);

system.start((err, ctx) => {
  if (err) {
    logger.logError(err, 'Problem starting system');
    process.exit(1);
  }

  logger.info('Started');

  const startTime = new Date();
  const { checks, metrics } = ctx;

});
