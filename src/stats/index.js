const exportDir = require('export-dir');
const { mergeAll, values, pipe, map } = require('ramda');
const pify = require('pify');
const runner = require('module-tsl-sql-run');
const formatter = require('module-tsl-sql-format');
const { join } = require('path');
const queries = exportDir(__dirname);
const Publisher = require('../lib/publisher');

module.exports = (checkType) => ({
  dependsOn: ['config', 'endpoints', 'rascal', 'rs', 'metaRds', 'metrics', 'mysql'],
  start: (config, endpoints, rascal, rs, metaRds, metrics, mysql, callback) => {
    AWS.config.update({ region: 'eu-west-1' });
    const emr = new AWS.EMR();
    const sqlFiles = join(__dirname, 'sql');
    const { run, runFormatted } = pify(runner(sqlFiles, rs.query, formatter));
    const { runFormatted: mdRun } = pify(runner(sqlFiles, metaRds.query, formatter));
    const { statsd } = metrics;
    const publisher = new Publisher(rascal, statsd);

    const backupS3 = new AWS.S3({
      accessKeyId: config.backup_s3_credentials.access_key,
      secretAccessKey: config.backup_s3_credentials.secret_key,
      region: 'eu-west-1',
    });
    const analyticsS3 = new AWS.S3({
      accessKeyId: config.analytics_s3_credentials.access_key,
      secretAccessKey: config.analytics_s3_credentials.secret_key,
      region: 'eu-west-1',
    });

    function create(init) {
      if (!init || (typeof(init) !== 'function')) {
        return {};
      }

      return init({ config, rs, run, runFormatted, statsd, mdRun, mysql, publisher, emr, backupS3, analyticsS3 })
        .then(() => ({}))
        .catch((err) => ({
          err,
        }));
    }

    const checks = checkType ? queries[checkType] : mergeAll(values(allChecks));

    return callback(null, pipe(values, map(create))(checks));
  },
});
