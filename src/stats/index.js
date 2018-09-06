const exportDir = require('export-dir');
const { mergeAll, values, pipe, map } = require('ramda');
const { join } = require('path');
const queries = exportDir(__dirname);
const Publisher = require('../lib/publisher');

module.exports = (checkType) => ({
  dependsOn: ['config', 'mysql'],
  start: (config, mysql, callback) => {
    const sqlFiles = join(__dirname, 'sql');
    const publisher = new Publisher();

    function create(init) {
      if (!init || (typeof(init) !== 'function')) {
        return {};
      }

      return init({ config, mysql })
        .then(() => ({}))
        .catch((err) => ({
          err,
        }));
    }

    const queries = queryType ? queries[checkType] : mergeAll(values(allChecks));

    return callback(null, pipe(values, map(create))(checks));
  },
});
