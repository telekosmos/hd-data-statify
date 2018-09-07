const logger = require('module-tsl-logger');

const extract = (rows, field) => (rows[0] && +rows[0][field]) || 0;
const format = (str) => parseInt(str).toLocaleString();
const formatCurrency = (str) => parseInt(str).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });

module.exports = ({ mysql }) => () =>
  mysql.query(`
    SELECT country, author_id, SUM(earnings) AS earnings FROM resource_by_author_by_day WHERE free != 1 AND country = 'GB' AND start_date > DATE_ADD(CURDATE(), INTERVAL -7 DAY) GROUP BY country, author_id ORDER BY 3 DESC LIMIT 1;
  `)
    .then((rows) => `The biggest earnings from an author in the GB store this week has been ${formatCurrency(extract(rows, 'earnings'))} !!`)
    .catch((err) => {
      logger.logError(err);
      throw err;
    });
