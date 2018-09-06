const logger = require('module-tsl-logger');

module.exports = (queries, mysql) => {
  const runStats = (req, res, next) => {
    // WIP. We need to "Promise.sequence" queries
    queries[0]({ mysql }).then((report) => res.send(report));
  }

  return {
    runStats,
  }
};
