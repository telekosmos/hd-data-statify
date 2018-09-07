const logger = require('module-tsl-logger');

const extract = (rows, field) => (rows[0] && +rows[0][field]) || 0;
const format = (str) => parseInt(str).toLocaleString();

module.exports = ({ mysql }) => () =>
  mysql.query(`
    SELECT author_id, COUNT(1) AS resources FROM resource_totals GROUP BY author_id ORDER BY resources DESC LIMIT 1;
  `)
    .then((rows) => `The most prolific author of ever has published ${format(extract(rows, 'resources'))} resources`)
    .catch((err) => {
      logger.logError(err);
      throw err;
    });
