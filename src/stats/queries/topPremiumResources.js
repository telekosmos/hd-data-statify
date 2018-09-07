const extractResources = (rows, field) => rows.map((row) => row[field] || 0);

module.exports = ({ mysql }) => () =>
  mysql.query(`
    SELECT resource_id
    FROM (
      SELECT
         resource_id,
         sum(downloads) as totals
      FROM resource_by_author_by_day
      WHERE start_date > '2018-08-01'
      GROUP BY resource_id ORDER BY totals DESC
    ) A LIMIT 10
    `)
    .then((rows) => {

      console.log(rows)
      return `<br />  Top 10 premium resources of the week ${extractResources(rows, 'resource_id')}`
    })
    .catch(console.log);
