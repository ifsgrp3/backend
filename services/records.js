const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const jwt = require('jsonwebtoken');

async function getMultiple(page = 1) {
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

async function registration(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const account_role = decoded["account_role"];
  if (account_role === 2) {
    const rows = await db.query(
      'CALL add_user_particulars($1, $2, $3, $4, $5, $6, $7, $8)' ,
      [req.body.nric, req.body.first_name, req.body.last_name, req.body.date_of_birth, req.body.age, req.body.gender, req.body.race, req.body.contact_number]
    );
    const status = 200;
    return { status };
  } else {
    return { status: 404 };
  }
}

async function getProfile(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const nric = decoded["nric"];
  const rows = await db.query(
      'SELECT * FROM user_particulars where nric = $1', [nric]
  );
  const data = helper.emptyOrRows(rows);
  return { data };
}

async function removeUserParticulars() {
  const rows = await db.query(
    'CALL remove_user_particulars($1)' ,
    [credentials.nric]
  );
  const status = 200;
  return { status };
}

// Contact got problem???
async function updateName(info) {
  const rows = await db.query(
    'CALL update_user_first_last_name($1, $2, $3)' ,
    [info.nric, info.new_last_name, info.new_first_name]
  );
  // const data = helper.emptyOrRows(rows);
  const status = 200;
  return { status };
}

async function updateContactNumber(info) {
  const rows = await db.query(
    'CALL update_contact_number($1, $2)' ,
    [info.nric, info.new_contact_number]
  );
  // const data = helper.emptyOrRows(rows);
  const status = 200;
  return { status };
}

async function addAddress(info) {
  const rows = await db.query(
    'CALL add_user_address($1, $2, $3, $4, $5)' ,
    [info.nric, info.street_name, info.unit_number, info.zip_code, info.area]
  );
  const data = helper.emptyOrRows(rows);
  const status = 200;
  return { data, status };
}

async function updateAddress(info) {
  const rows = await db.query(
    'CALL update_address($1, $2, $3, $4, $5)' ,
    [info.nric, info.new_street_name, info.new_unit_number, info.new_zip_code, info.new_area]
  );
  const data = helper.emptyOrRows(rows);
  const status = 200;
  return { data, status };
}

async function uploadTestResults(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const account_role = decoded["account_role"];
  const nric = decoded["nric"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL add_covid19_results($1, $2, $3)' ,
      [nric, req.body.covid19_test_type, req.body.test_result]
    );
    const status = 200;
    return { status };
  } else {
    return { status: 404 };
  }
}

async function getTestHistory(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.db.secret);
  const nric = decoded["nric"];
    const rows = await db.query(
        'SELECT * FROM covid19_test_results where nric = $1', [nric]
    );
    const data = helper.emptyOrRows(rows);
    return { data };
}

async function uploadDeclaration(req) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, config.db.secret);
    const nric = decoded["nric"];
    const rows = await db.query(
        'CALL add_health_declaration($1, $2, $3)' ,
        [nric, req.body.covid_symptoms, req.body.temperature]
      );
      const status = 200;
      return { status };
}

async function getDeclarationHistory(req) {
    const rows = await db.query(
        'SELECT * FROM health_declaration', []
    );
    const data = helper.emptyOrRows(rows);
    return { data };
}

async function getRecordLogs(page = 1) {
    //const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      'SELECT * FROM record_logs' ,
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

async function uploadVaccinationStatus(data) {
    const rows = await db.query(
        'CALL add_vaccination_results($1, $2, $3, $4, $5, $6)' ,
        [data.nric, data.vaccination_status, data.vaccine_type, data.vaccination_centre_location, data.first_dose_date, data.second_dose_date]
      );
    const status = 200;
    return { status };
}

async function getVaccinationStatus(info) {
    const rows = await db.query(
        'SELECT * FROM vaccination_results where where nric = $1', [info.nric]
    );
    // console.log('print:', rows[0])
    const data = helper.emptyOrRows(rows);
    const meta = { page };
    return {
        data,
        meta
    }
}

async function getDashboard(page = 1) {
  const rows = await db.query(
      'SELECT vaccination_results.nric, temperature, first_dose_date, second_dose_date, covid_symptoms FROM vaccination_results INNER JOIN health_declaration ON (vaccination_results.nric = health_declaration.nric)' ,
      []
  );
  // console.log('print:', rows[0])
  console.log(rows);
  const data = helper.emptyOrRows(rows);
  const meta = { page };
  return {
      data,
      meta
  }
}

module.exports = {
  getMultiple,
  registration,
  uploadTestResults,
  getTestHistory,
  uploadDeclaration,
  getDeclarationHistory,
  getRecordLogs,
  uploadVaccinationStatus,
  getVaccinationStatus,
  updateContactNumber,
  addAddress,
  updateAddress,
  removeUserParticulars,
  updateName,
  getDashboard,
  getProfile
}