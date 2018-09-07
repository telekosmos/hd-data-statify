const logger = require('module-tsl-logger');

const sequential = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result =>
      func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]))


module.exports = (queries) => {
  const runStats = (req, res, next) => sequential(queries).then((report) => res.send(report));

  return {
    runStats,
  }
};
