const logger = require('module-tsl-logger');

module.exports = () => {
  const runStats = (req, res, next) => res.send('runningStats');

  return {
    runStats,
  }
};
