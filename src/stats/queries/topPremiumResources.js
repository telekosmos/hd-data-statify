const logger = require('module-tsl-logger');

const extractResources = (rows, field) => rows.map((row) => row[field] || '');

module.exports = ({ mysql }) => () =>
  mysql.query(`
    SELECT
         resource_id,
         resource_name,
         sum(buys) as totals
      FROM resource_by_author_by_day
      WHERE start_date > DATE_ADD(CURDATE(), INTERVAL -7 DAY)
      GROUP BY resource_id, resource_name ORDER BY totals DESC
      LIMIT 10;
    `)
    .then((rows) => {
      const message = `<strong>Top 10 premium resources of the week:</strong>`
      const list = rows.map(row => `&nbsp;&nbsp;&nbsp;&nbsp;${row['totals']} buys - <a href="https://www.tes.com/teaching-resource/resource-${row['resource_id']}" >${row['resource_name']}</a>`)
      return [message].concat(list).join('<br/>')
    })
    .catch((err) => {
      logger.logError(err);
      throw err;
    });
