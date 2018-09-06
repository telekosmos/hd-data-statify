const exportDir = require('export-dir');
const { mergeAll, values, pipe, map } = require('ramda');
const { join } = require('path');
const allQueries = exportDir(__dirname);

module.exports = (queryType) => ({
  dependsOn: ['config', 'mysql'],
  start: (config, mysql, callback) => {
    const sqlFiles = join(__dirname, 'sql');

    const create = (init) => {
      if (!init || (typeof(init) !== 'function')) {
        return {};
      }

      return init({ config, mysql })
        .then(() => ({}))
        .catch((err) => ({
          err,
        }));
    }

    const queries = queryType ? allQueries[checkType] : mergeAll(values(allQueries));

    return callback(null, pipe(values, map(create))(queries));
  },
});
