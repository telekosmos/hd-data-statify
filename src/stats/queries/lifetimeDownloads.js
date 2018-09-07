const extract = (rows, field) => (rows[0] && +rows[0][field]) || 0;
const format = (str) => parseInt(str).toLocaleString();

module.exports = ({ mysql }) => () =>
  mysql.query('SELECT SUM(lifetime_downloads) AS total_downloads FROM resource_totals')
    .then((rows) => `${format(extract(rows, 'total_downloads'))} lifetime resources downloads`)
    .catch((err) => {
      logger.logError(err);
      throw err;
    });
