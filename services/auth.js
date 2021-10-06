const db = require('./auth_db');
const helper = require('../helper');
const PythonShell = require('python-shell').PythonShell;

async function getCredentials(page = 1) {
  //const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    'SELECT * FROM login_credentials' ,
    []
  );
  // console.log('print:', rows[0])
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}

async function login(credentials) {
    const rows = await db.query(
        'SELECT ble_serial_number FROM login_credentials WHERE nric = $1 AND hashed_password = $2 AND account_role = $3' ,
        [credentials.nric, credentials.hashed_password, credentials.account_role]
    );
    const data = helper.emptyOrRows(rows);
    return { data }
}

async function mfa(ble_data) {
  const { success, err = '', results } = await new Promise((resolve, reject) => {
    PythonShell.run('mfa.py', null, function (err, results) {
      setTimeout(() => {
        if (err) {
          reject({ success: false, err});
        }
        console.log('results: %j', results);
        resolve({ success: true, results});
      }, )
    });
  });
  const status = 200;
  return { status }
}

async function deactivate(acc) {
  const rows = await db.query(
    "UPDATE login_credentials SET account_status = B'0' WHERE nric = $1" ,
    [acc.nric]
  );
  const status = 200;
  return { status }
}

async function activate(acc) {
  const rows = await db.query(
    "UPDATE login_credentials SET account_status = B'1' WHERE nric = $1" ,
    [acc.nric]
  );
  const status = 200;
  return { status }
}

async function getAccountLogs(page = 1) {
  //const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    'SELECT * FROM account_logs' ,
    []
  );
  // console.log('print:', rows[0])
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}

module.exports = {
  getCredentials,
  login,
  mfa,
  deactivate,
  activate,
  getAccountLogs
}