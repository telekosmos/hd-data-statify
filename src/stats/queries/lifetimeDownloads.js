const extract = (rows, field) => (rows[0] && +rows[0][field]) || 0;

module.exports = ({ mysql }) => () =>
  mysql.query('SELECT SUM(lifetime_downloads) AS total_downloads FROM resource_totals')
    .then((rows) => `${extract(rows, 'total_downloads')} lifetime resources downloads`)
    .catch(console.log);
