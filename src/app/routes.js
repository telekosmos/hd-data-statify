const logger = require('module-tsl-logger');

const logRequest = logger.middleware();

module.exports = (app) => {
  app.get('/api/', logRequest, (req, res) => res.send('Hello world'));
};
