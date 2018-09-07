const logger = require('module-tsl-logger');

const extractResources = (rows, field) => rows.map((row) => row[field] || '');

module.exports = ({ mysql }) => () =>
  mysql.query(`
    SELECT SUM(num_distinct_unique_ids) as totals, job_id 
      FROM job_by_device_by_day 
      WHERE event_name IN ('apply')
      AND event_date > DATE_ADD(CURDATE(), INTERVAL -7 DAY)
      GROUP BY job_id
      ORDER BY 1 DESC
      LIMIT 10;
    `)
    .then((rows) => {
      const message = `<strong>Top 10 jobs by applications:</strong>`
      const list = rows.map(row => `&nbsp;&nbsp;&nbsp;&nbsp;${row['totals']} applications <a href="https://www.tes.com/jobs/vacancy/some-job-${row['job_id']}">Link</a>`)
      return [message].concat(list).join('<br/>')
    })
    .catch((err) => {
      logger.logError(err);
      throw err;
    });
