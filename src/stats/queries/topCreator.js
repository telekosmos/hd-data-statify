const extract = (rows, field) => (rows[0] && +rows[0][field]) || 0;

module.exports = ({ mysql }) => () =>
  mysql.query(`
    -- Top creator Resources
    SELECT author_id , COUNT(*) as totals
    FROM (
      SELECT distinct
         resource_id,
         author_id
         FROM resource_totals
    ) topCreator
    ORDER BY 2 DESC LIMIT 1
  `)
    .then((rows) => ` Author with higher number of resources ${extract(rows, 'author_id')} with ${extract(rows, 'totals')}  resources created`)
    .catch(console.log);
