const logger = require('module-tsl-logger');

const logRequest = logger.middleware();

module.exports = (app, controller) => {
  app.get('/api/', logRequest, controller.helloWorld);
};
