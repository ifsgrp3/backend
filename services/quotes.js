const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    'SELECT * FROM covid19_test_results;' ,
    [offset, config.listPerPage]
  );
  // console.log('print:', rows[0])
  const data = helper.emptyOrRows(rows);
  console.log(data);
  const meta = {page};
  return {
    data,
    meta
  }
}

module.exports = {
  getMultiple
}