const { Pool, Client } = require('pg');
const client = new Client({
          user: 'postgres',
          host: '',
          database: 'postgres',
          password: 'mysecretpassword',
          port: 5435
})
client.connect()
client.query('select * from admins', (err, res) => {
          console.log(err, res)
          client.end()
})