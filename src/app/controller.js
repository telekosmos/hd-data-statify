const logger = require('module-tsl-logger');

const header = '<strong>-- Last week interesting data facts --</strong>';

const sequential = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result =>
      func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]));

module.exports = (hipchat, queries) => {
  const send2hipchat = (msg) => hipchat.send(msg, "green", true);
  const runStats = (req, res, next) =>
    sequential(queries)
      .then((report) => send2hipchat([header].concat(report).join('<br />')))
      .then(msg => res.send(msg));

  return {
    runStats,
  }
};
