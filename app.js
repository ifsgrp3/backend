// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

const { Pool, Client } = require('pg');
// const pool = new Pool({
//   user: 'postgres',
//   host: '192.168.56.1',
//   database: 'postgres',
//   password: 'mysecretpassword',
//   port: 5432,
// })
// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })
const client = new Client({
  user: 'postgres',
  host: '172.20.0.5',
  database: 'credetials',
  password: 'mysecretpassword',
  port: 5432
})
client.connect()
client.query('select * from login_credentials', (err, res) => {
  console.log(err, res)
  client.end()
})