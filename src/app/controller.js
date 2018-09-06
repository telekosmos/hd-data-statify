const logger = require('module-tsl-logger');

module.exports = () => {
  const helloWorld = (req, res, next) => res.send('Hello world from the controller');

  return {
    helloWorld,
  }
};
