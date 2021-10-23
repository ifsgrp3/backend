const db = require('./auth_db');
const helper = require('../helper');
// const PythonShell = require('python-shell').PythonShell;
const {spawn} = require('child_process');
const jwt = require('jsonwebtoken');
const config = require('../auth_config')

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
    const nric = credentials.nric;
    const hashed_password = credentials.hashed_password;
    const secret = config.db.secret;
    if (!nric || !hashed_password) {
      return {
          error: 'User name and password required'
      }
    }
    const rows = await db.query(
        'SELECT nric, ble_serial_number, account_status FROM login_credentials WHERE nric = $1 AND hashed_password = $2 AND account_role = $3' ,
        [nric, hashed_password, credentials.account_role]
    );
    // Update password attempts, > 10 attempts => deactivate
    const data = helper.emptyOrRows(rows);
    console.log(data);
    if (!data[0]) {
      await db.query(
        "UPDATE login_credentials SET password_attempts = password_attempts + 1 WHERE nric = $1" ,
        [nric]
      );
      const updateRow = await db.query(
        'SELECT password_attempts FROM login_credentials WHERE nric = $1' ,
        [nric]
      );
      const newData = helper.emptyOrRows(updateRow);
      console.log(newData[0].password_attempts);
      if( newData[0].password_attempts > 10) {
        return await deactivate({ nric: nric });
      }
      const status = 401;
      const error = 'Invalid username or password';
      return { data: newData, status, error };
    }
    await db.query(
      "UPDATE login_credentials SET password_attempts = 0 WHERE nric = $1" ,
      [nric]
    );
    const token = jwt.sign(
      data[0], secret, { expiresIn: 60 * 60 }
    );
    return { token }
}

async function mfa(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const serialNumber = decoded["ble_serial_number"];
  // const serialNumber = "1234567890123456"
  return new Promise((resolve, reject) => {
    const python = spawn("python", ["services/mfa.py"]);
    python.stdout.on("data", (data) => {
      //resolve(data.toString().replace("\r\n",""));
      data = data.toString().replace("\r\n","");
      console.log(data)
      console.log(serialNumber)
      if (data === serialNumber) {
        resolve({ status: 200 });
      } else {
        resolve({ status: 401, error: "BLE serial number not matched!" });
      }
    });

    python.stderr.on("data", (data) => {
      reject(data.toString());
    });
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
  const message = "Account deactivated"
  return { status, message }
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
    'SELECT * FROM account_logs LIMIT 200' ,
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