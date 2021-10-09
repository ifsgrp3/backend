const db = require('./auth_db');
const helper = require('../helper');
const PythonShell = require('python-shell').PythonShell;
const {spawn} = require('child_process');

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

async function registration(data) {
  const rows = await db.query(
    "CALL add_user($1, $2, $3, $4, $5, $6)" ,
    [data.nric, data.hashed_password, data.user_salt, data.ble_serial_number, data.account_role, data.admin_id]
  );
  const status = 200;
  return { status }
}

async function login(credentials) {
    const rows = await db.query(
        'SELECT ble_serial_number, account_status FROM login_credentials WHERE nric = $1 AND hashed_password = $2 AND account_role = $3' ,
        [credentials.nric, credentials.hashed_password, credentials.account_role]
    );
    // Update password attempts, > 10 attempts => deactivate
    const data = helper.emptyOrRows(rows);
    return { data }
}

async function mfa() {
  // const { success, err = '', results } = await new Promise((resolve, reject) => {
  //   PythonShell.run('mfa.py', null, function (err, results) {
  //     // setTimeout(() => {
  //       if (err) {
  //         reject({ success: false, err});
  //       }
  //       console.log('results: %j', results);
  //       resolve({ success: true, results});
  //     // }, 8000)
  //     const status = 200;
  //     return { status }
  //   });
  // });
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn('python', ['mfa.py']);
  // collect data from script
  python.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
  // send data to browser
  return { data: dataToSend };
  });
}

async function deactivate(acc) {
  // const rows = await db.query(
  //   "UPDATE login_credentials SET account_status = B'0' WHERE nric = $1" ,
  //   [acc.nric]
  // );
  const rows = await db.query(
    "CALL deactivate_account($1)" ,
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

async function resetPasswordAttempts(data) {
  const rows = await db.query(
    "CALL reset_attempts($1)" ,
    [data.update_nric]
  );
  const status = 200;
  return { status }
}

module.exports = {
  getCredentials,
  login,
  mfa,
  deactivate,
  activate,
  getAccountLogs,
  registration,
  resetPasswordAttempts
}