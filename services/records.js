const db = require('./db');
const helper = require('../helper');
const config = require('../config');

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

async function registration(credentials) {
    const rows = await db.query(
      'CALL add_user_particulars($1, $2, $3, $4, $5, $6, $7, $8)' ,
      [credentials.nric, credentials.first_name, credentials.last_name, credentials.date_of_birth, credentials.age, credentials.gender, credentials.race, credentials.contact_number]
    );
    const status = 200;
    return { status };
}

// Contact got problem???
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

async function uploadTestResults(test) {
    const rows = await db.query(
        'CALL add_covid19_results($1, $2, $3)' ,
        [test.nric, test.covid19_test_type, test.test_result]
      );
      const status = 200;
      return { status };
}

async function getTestHistory(test) {
    const rows = await db.query(
        'SELECT * FROM covid19_test_results where nric = $1', [test.nric]
    );
    const data = helper.emptyOrRows(rows);
    return { data };
}

async function uploadDeclaration(declaration) {
    const rows = await db.query(
        'CALL add_health_declaration($1, $2, $3)' ,
        [declaration.nric, declaration.covid_symptoms, declaration.temperature]
      );
      const status = 200;
      return { status };
}

async function getDeclarationHistory(declaration) {
    const rows = await db.query(
        'SELECT * FROM health_declaration where nric = $1', [declaration.nric]
    );
    const data = helper.emptyOrRows(rows);
    return { data };
}

async function query(filter) {
    // const rows = await db.query(
    //     'SELECT * FROM vaccination_results where nric = $1', [declaration.nric]
    // );
    // const data = helper.emptyOrRows(rows);
    // return { data };
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

async function getVaccinationStatus(page = 1) {
    const rows = await db.query(
        'SELECT * FROM vaccination_results' ,
        []
    );
    // console.log('print:', rows[0])
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
  updateAddress
}