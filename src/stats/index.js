const exportDir = require('export-dir');
const { mergeAll, values, pipe, map } = require('ramda');
const { join } = require('path');
const allQueries = exportDir(__dirname);
const R = require('ramda');

module.exports = (queryType) => ({
  dependsOn: [],
  start: (callback) => {
    console.log('allQueries', allQueries)
    const promiseQueries = R.pipe(
      R.map(R.values),
      R.values,
      R.flatten,
    )(allQueries)
    console.log('pepe')
    return callback(null, promiseQueries)
  },
});
