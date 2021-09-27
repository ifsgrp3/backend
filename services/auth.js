const db = require('./auth_db');
const helper = require('../helper');
const config = require('../config');

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
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn('python',["mfa.py"]);
  pythonProcess.stdout.on('data', (data) => {
    console.log(data.toString());
    // if (ble_data.ble_serial_number == data.toString()) {
    //   return { data }
    // }
  });
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