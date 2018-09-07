const exportDir = require('export-dir');
const { mergeAll, values, pipe, map } = require('ramda');
const { join } = require('path');
const allQueries = exportDir(__dirname);
const R = require('ramda');

module.exports = (queryType) => ({
  dependsOn: ['mysql'],
  start: (mysql, callback) => {
    const dependencies = { mysql };
    const promiseQueries = R.pipe(
      R.map(R.values),
      R.values,
      R.flatten,
      R.map(p => p(dependencies))
    )(allQueries)

    return callback(null, promiseQueries)
  },
});
