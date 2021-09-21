const { Pool } = require('pg');
const config = require('../config');
const pool = new Pool(config.db);

// const { Client } = require('pg');
// const client = new Client(config.db);
/**
 * Query the database using the pool
 * @param {*} query 
 * @param {*} params 
 * 
 * @see https://node-postgres.com/features/pooling#single-query
 */
async function query(query, params) {
  
    const {rows, fields} = await pool.query(query, params);
    return rows;
 
    // const {rows, fields} = await pool.query(query, params);
}

module.exports = {
  query
}