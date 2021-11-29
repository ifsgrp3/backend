const db = require('./auth_db');
const helper = require('../helper');
// const PythonShell = require('python-shell').PythonShell;
const {spawn} = require('child_process');
const exec = require('child_process').execFile;
const jwt = require('jsonwebtoken');
const config = require('../auth_config');
const bcrypt = require('bcrypt');
const cryptoJs = require("crypto-js");
require('dotenv').config()

function decryptData(data) {
  try {
    const bytes = cryptoJs.AES.decrypt(data, process.env.ENCRYPTION_KEY);
    if (bytes.toString()) {
      return JSON.parse(bytes.toString(cryptoJs.enc.Utf8));
    }
    return data;
  } catch (e) {
    console.log(e);
  }
}

async function getCredentials(req) {
  //const offset = helper.getOffset(page, config.listPerPage);
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      `SELECT nric, account_status, pgp_sym_decrypt(ble_serial_number::bytea,'${process.env.SECRET_KEY}') as ble_serial_number 
      FROM login_credentials` ,
      []
    );
    // console.log('print:', rows[0])
    const data = helper.emptyOrRows(rows);
    //const meta = {page};
    return {
      data
    }
  } else {
    return { status: 404 }
  }
}

async function getOneCredential(req) {
  //const offset = helper.getOffset(page, config.listPerPage);
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      `SELECT nric, 
      pgp_sym_decrypt(account_role::bytea,'${process.env.SECRET_KEY}') as account_role , 
      pgp_sym_decrypt(ble_serial_number::bytea,'${process.env.SECRET_KEY}') as ble_serial_number 
      FROM login_credentials
      where nric = $1` ,
      [req.body.nric]
    );
    // console.log('print:', rows[0])
    const data = helper.emptyOrRows(rows);
    //const meta = {page};
    return {
      data
    }
  } else {
    return { status: 404 }
  }
}


async function registration(req) {
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      "CALL add_user($1, $2, $3, $4, $5)" ,
      [req.body.nric, req.body.hashed_password, req.body.user_salt, req.body.ble_serial_number, req.body.account_role]
    );
    const status = 200;
    return { status }
  } else {
    return { status: 404 }
  }
}

async function login(credentials) {
    const nric = credentials.nric;
    const password = credentials.password;
    const secret = process.env.JWT_KEY;
    if (!nric || !password) {
      return {
          error: 'User name and password required'
      }
    }
    const rows = await db.query(
        `SELECT nric, 
        pgp_sym_decrypt(ble_serial_number::bytea,'${process.env.SECRET_KEY}') as ble_serial_number,
         account_status,
        pgp_sym_decrypt(account_role::bytea,'${process.env.SECRET_KEY}') as account_role,
        hashed_password
        FROM login_credentials 
        WHERE nric = $1` ,
        [nric]
    );
    // Update password attempts, > 10 attempts => deactivate
    const data = helper.emptyOrRows(rows);
    console.log(data);
    if (!data[0]) {
      return {
        error: 'Invalid username or password'
      };
    }
    // const token = jwt.sign(
    //   data[0], secret, { expiresIn: '7d' }
    // );
    // return { token }
    const compareRes = await bcrypt.compare(password, data[0].hashed_password);
        if (compareRes) {
          // const user = await db.query(
          //   "SELECT * from online_users WHERE nric = $1" ,
          //   [nric]
          // );
          // const userData = helper.emptyOrRows(user);
          // console.log(userData)
          // if (userData.length > 0) {
          //   return {
          //     error: 'Overlapped session'
          //   };
          // } else {
          //   await db.query(
          //     "CALL add_online_user($1)" ,
          //     [nric]
          //   );
            await db.query(
              "UPDATE login_credentials SET password_attempts = '0' WHERE nric = $1" ,
              [nric]
            );
            const cleanedData = {
              nric: data[0].nric,
              account_role: data[0].account_role
            }
            const token = jwt.sign(
              cleanedData, secret, { expiresIn: 60 * 60 }
            );
            return { token };
          // }
        }
        else {
          const newData = await db.query(
            "SELECT password_attempts FROM login_credentials WHERE nric = $1" ,
            [nric]
          );
          if( parseInt(newData[0].password_attempts) >  9) {
            return await deactivate({ nric: nric });
          }
          await db.query(
            "UPDATE login_credentials SET password_attempts = (password_attempts::INTEGER + 1)::VARCHAR WHERE nric = $1" ,
            [nric]
          );
            return {
                error: 'Invalid username or password'
            };
        }
}

async function logout(req) {
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const nric = decoded["nric"];
  // const deleted = await db.query(
  //   "CALL delete_online_user($1)" ,
  //   [nric]
  // );
  // const data = helper.emptyOrRows(deleted);
  return { status: 404 }
}

async function mfa(req) {
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const nric = decoded["nric"];
  const rows = await db.query(
    `SELECT 
    pgp_sym_decrypt(ble_serial_number::bytea,'${process.env.SECRET_KEY}') as ble_serial_number
    FROM login_credentials 
    WHERE nric = $1` ,
    [nric]
  );
  const data = helper.emptyOrRows(rows);
  const serialNumber = data[0].ble_serial_number
  // const serialNumber = "5w4lj9nek0dpz1o73assgsx4pg6pj73ztjr8wz5bkzk3qtcj5miexhqajka7re4c"
  return new Promise((resolve, reject) => {
    // const python = spawn("python", ["services/mfa.py"]);
    const python = exec("services/dist/mfa.exe");
    python.stdout.on("data", (data) => {
      //resolve(data.toString().replace("\r\n",""));
      data = data.toString().replace("\r\n","");
      const arr = data.split(",");
      console.log(arr)
      console.log(serialNumber)
      if (arr[0] === serialNumber) {
        const user = db.query(
          "SELECT * from online_users WHERE nric = $1 AND iv = $2" ,
          [nric, arr[1]]
        );
        const userData = helper.emptyOrRows(user);
        if (userData.length > 0) {
          reject(arr[0]);
        } else {
          db.query(
            "CALL add_online_user($1, $2)", [nric, arr[1]]
          );
          resolve({ status: 200 });
        }
      } else {
        reject(arr[0]);
      }
    });

    python.stderr.on("data", (data) => {
      reject(data.toString());
    });
    // exec('services/dist/mfa.exe', function(err, data) {  
    //   console.log(err)
    //   console.log(data.toString());                       
    // });
    // var execution = spawn.exec('services/dist/mfa.exe');
    // execution.stdout.pipe(process.stdout);
    // execution.on('exit', function() {
    //   process.exit();
    // })  
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

async function getAccountLogs(req) {
  //const offset = helper.getOffset(page, config.listPerPage);
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'SELECT * FROM account_logs' ,
      []
    );
    // console.log('print:', rows[0])
    const data = helper.emptyOrRows(rows);
    //const meta = {page};
    return {
      data
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

async function updatePassword(req) {
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      "CALL update_user_password($1, $2)" ,
      [req.body.update_nric, req.body.new_hashed_password]
    );
    const status = 200;
    return { status }
  } else {
    return { status: 404 }
  }
}

async function updateBleNumber(req) {
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      "CALL update_user_ble($1, $2)" ,
      [req.body.update_nric, req.body.new_ble_serial_number]
    );
    const status = 200;
    return { status }
  } else {
    return { status: 404 }
  }
}

async function updateAccountRole(req) {
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      "CALL update_user_role($1, $2)" ,
      [req.body.update_nric , req.body.new_account_role]
    );
    const status = 200;
    return { status }
  } else {
    return { status: 404 }
  }
}

async function getMenuItems(req) {
  const token = decryptData(req.headers.authorization);
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 3) {
    const data = [
      { path: '/user-profile', title: 'User Profile',  icon:'person', class: '' },
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
      { path: '/record-logs' , title: 'Records Logging', icon: 'content_paste', class: '' },
      { path: '/news', title: 'News Bulletin', icon: 'content_paste', class: '' },
      { path: '/update', title: 'Update Information', icon: 'content_paste', class: '' }
    ]
    return { data: data };
  } else {
    const data = [
      { path: '/covid-declaration' , title: 'COVID-19 Personnel Dashboard', icon: 'content_paste', class: '' },
      { path: '/covid-test', title: 'COVID-19 Test Results', icon: 'content_paste', class: '' },
      { path: '/vaccination' , title: 'Vaccination Status', icon: 'content_paste', class: '' },
      { path: '/news', title: 'News Bulletin', icon: 'content_paste', class: '' }
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
  getMenuItems,
  logout,
  updatePassword,
  updateAccountRole,
  updateBleNumber,
  getOneCredential
}