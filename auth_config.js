const env = process.env;

const config = {
  db: { /* do not put password or any sensitive info here, done only for demo */
    host: env.DB_HOST || 'group3-1-i.comp.nus.edu.sg',
    port: env.DB_PORT || '5435',
    user: env.DB_USER || 'postgres', // ''User'
    password: env.DB_PASSWORD || 'mysecretpassword',
    database: env.DB_NAME || 'credentials',
  }
};

module.exports = config;