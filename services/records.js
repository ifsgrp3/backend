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
      'INSERT INTO user_particulars(nric, first_name, last_name, date_of_birth, age, gender, race, contact_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)' ,
      [credentials.nric, credentials.first_name, credentials.last_name, credentials.date_of_birth, credentials.age, credentials.gender, credentials.race, credentials.contact_number]
    );
    const status = 200;
    return { status };
}

async function uploadTestResults(test) {
    const rows = await db.query(
        'INSERT INTO covid19_test_results(nric, covid19_test_type, test_result, test_date, test_id) VALUES ($1, $2, $3, $4, (SELECT count(*) FROM covid19_test_results) + 1)' ,
        [test.nric, test.covid19_test_type, test.test_result, test.test_date]
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
        'INSERT INTO health_declaration(nric, covid_symptoms, temperature, declaration_date, health_declaration_id) VALUES ($1, $2, $3, $4, (SELECT count(*) FROM health_declaration) + 1)' ,
        [declaration.nric, declaration.covid_symptoms, declaration.temperature, declaration.declaration_date]
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
        'INSERT INTO vaccination_results(nric, vaccination_status, vaccine_type, vaccination_centre_location, first_dose_date, second_dose_date, vaccination_certificate_id) VALUES ($1, $2, $3, $4, $5, $6, (SELECT count(*) FROM vaccination_results) + 1)' ,
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
  getVaccinationStatus
}