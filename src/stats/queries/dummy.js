const { utc } = require('moment');

const extract = (rows, field) => (rows[0] && +rows[0][field]) || 0;

module.exports = ({ mysql }) => new Promise((resolve, reject) => {
  const yesterday = utc().subtract(1, 'day').format('YYYYMMDD');
  const table = 'resource_totals';
  // console.log('************* dummy.jsssss');
  return mysql.query('select sum(lifetime_downloads) as total_downloads from resource_totals')
    .then((rows) => {
      // console.log(`*************************** mysql.query.then ${extract(rows, 'total_downloads')}`)
      resolve(`${extract(rows, 'total_downloads')} lifetime resources downloads`);
    })
    .catch(reject)
}
);

