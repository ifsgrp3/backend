const db = require('./auth_db');
const helper = require('../helper');
// const PythonShell = require('python-shell').PythonShell;
const {spawn} = require('child_process');
const jwt = require('jsonwebtoken');
const config = require('../auth_config');
require('dotenv').config()

async function getCredentials(req, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      `SELECT nric, account_status, pgp_sym_decrypt(ble_serial_number::bytea,'${process.env.SECRET_KEY}') as ble_serial_number 
      FROM login_credentials OFFSET $1 LIMIT $2` ,
      [offset, config.listPerPage]
    );
    // console.log('print:', rows[0])
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
  } else {
    return { status: 404 }
  }
}

async function registration(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      "CALL add_user($1, $2, $3, $4, $5, $6)" ,
      [req.body.nric, req.body.hashed_password, req.body.user_salt, req.body.ble_serial_number, req.body.account_role, req.body.admin_id]
    );
    const status = 200;
    return { status }
  } else {
    return { status: 404 }
  }
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
        `SELECT nric, 
        pgp_sym_decrypt(ble_serial_number::bytea,'${process.env.SECRET_KEY}') as ble_serial_number,
         account_status,
        pgp_sym_decrypt(account_role::bytea,'${process.env.SECRET_KEY}') as account_role
        FROM login_credentials 
        WHERE nric = $1 AND hashed_password = $2` ,
        [nric, hashed_password]
    );
    // Update password attempts, > 10 attempts => deactivate
    const data = helper.emptyOrRows(rows);
    console.log(data);
    if (!data[0]) {
      await db.query(
        "UPDATE login_credentials SET password_attempts = (password_attempts::INTEGER + 1)::VARCHAR WHERE nric = $1" ,
        [nric]
      );
      const updateRow = await resetPasswordAttempts({ nric: nric });
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
      "UPDATE login_credentials SET password_attempts = '0' WHERE nric = $1" ,
      [nric]
    );
    const token = jwt.sign(
      data[0], secret, { expiresIn: '7d' }
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

async function getAccountLogs(req, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'SELECT * FROM account_logs OFFSET $1 LIMIT $2' ,
      [offset, config.listPerPage]
    );
    // console.log('print:', rows[0])
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
  } else {
    return { status: 404 }
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

async function getMenuItems(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const account_role = decoded["account_role"];
  if (account_role == 3) {
    const data = [
      { path: '/user-profile', title: 'User Profile',  icon:'person', class: '' },
      { path: '/covid-test', title: 'COVID-19 Test Results', icon: 'content_paste', class: '' },
      { path: '/covid-history', title: 'COVID-19 Test History', icon: 'content_paste', class: '' },
      { path: '/health-declaration', title: 'Health Declaration', icon: 'content_paste', class: '' },
      { path: '/health-record', title: 'Health Record', icon: 'content_paste', class: '' },
      { path: '/statistics', title: 'Query Database', icon: 'content_paste', class: '' },
      { path: '/news', title: 'News Bulletin', icon: 'content_paste', class: '' },
    ] 
    return { data: data };
  } else if (account_role == 1) {
    const data = [
      { path: '/accounts', title: 'Accounts Management', icon: 'content_paste', class: '' },
      { path: '/registration', title: 'User Registration', icon: 'content_paste', class: '' },
      { path: '/account-logs' , title: 'Accounts Logging', icon: 'content_paste', class: '' },
      { path: '/record-logs' , title: 'Records Logging', icon: 'content_paste', class: '' }
    ]
    return { data: data };
  } else {
    const data = [
      { path: '/covid-declaration' , title: 'COVID-19 Personnel Dashboard', icon: 'content_paste', class: '' },
      { path: '/health-declaration', title: 'Health Declaration', icon: 'content_paste', class: '' },
      { path: '/vaccination' , title: 'Vaccination Status', icon: 'content_paste', class: '' }
    ]
    return { data: data };
  }
  // data = JSON.stringify(data);
}

module.exports = {
  getCredentials,
  login,
  mfa,
  deactivate,
  activate,
  getAccountLogs,
  registration,
  resetPasswordAttempts,
  getMenuItems
}