const db = require('./db');
const logs_db = require('./logs_db')
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
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  // if (account_role === 2) {
    const rows = await db.query(
      'CALL add_user_particulars($1, $2, $3, $4, $5, $6, $7, $8)' ,
      [req.body.nric, req.body.first_name, req.body.last_name, req.body.date_of_birth, req.body.age, req.body.gender, req.body.race, req.body.contact_number]
    );
    const status = 200;
    return { status };
  // } else {
  //   return { status: 404 };
  // }
}

async function getProfile(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const nric = decoded["nric"];
  const rows = await db.query(
      `SELECT nric, 
      pgp_sym_decrypt(first_name::bytea,'${process.env.SECRET_KEY}') as first_name,
      pgp_sym_decrypt(last_name::bytea,'${process.env.SECRET_KEY}') as last_name,
      pgp_sym_decrypt(date_of_birth::bytea,'${process.env.SECRET_KEY}') as date_of_birth,
      pgp_sym_decrypt(age::bytea,'${process.env.SECRET_KEY}') as age,
      pgp_sym_decrypt(gender::bytea,'${process.env.SECRET_KEY}') as gender,
      pgp_sym_decrypt(race::bytea,'${process.env.SECRET_KEY}') as race,
      pgp_sym_decrypt(contact_number::bytea,'${process.env.SECRET_KEY}') as contact_number
      FROM user_particulars 
      where nric = $1`, [nric]
  );
  const data = helper.emptyOrRows(rows);
  return { data };
}

async function getOneProfile(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      `SELECT nric, 
      pgp_sym_decrypt(first_name::bytea,'${process.env.SECRET_KEY}') as first_name,
      pgp_sym_decrypt(last_name::bytea,'${process.env.SECRET_KEY}') as last_name,
      pgp_sym_decrypt(date_of_birth::bytea,'${process.env.SECRET_KEY}') as date_of_birth,
      pgp_sym_decrypt(age::bytea,'${process.env.SECRET_KEY}') as age,
      pgp_sym_decrypt(gender::bytea,'${process.env.SECRET_KEY}') as gender,
      pgp_sym_decrypt(race::bytea,'${process.env.SECRET_KEY}') as race,
      pgp_sym_decrypt(contact_number::bytea,'${process.env.SECRET_KEY}') as contact_number
      FROM user_particulars 
      where nric = $1`, [req.body.nric]
    );
    const data = helper.emptyOrRows(rows);
    return { data };
  } else {
    return { status: 404 }
  }
}

async function getAddress(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      `SELECT nric, 
      pgp_sym_decrypt(street_name::bytea,'${process.env.SECRET_KEY}') as street_name,
      pgp_sym_decrypt(unit_number::bytea,'${process.env.SECRET_KEY}') as unit_number,
      pgp_sym_decrypt(zip_code::bytea,'${process.env.SECRET_KEY}') as zip_code,
      pgp_sym_decrypt(area::bytea,'${process.env.SECRET_KEY}') as area
      FROM user_address
      where nric = $1`, [req.body.nric]
    );
    const data = helper.emptyOrRows(rows);
    return { data };
  } else {
    return { status: 404 }
  }
}

async function removeUserParticulars(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL remove_user_particulars($1)' ,
      [req.body.nric]
    );
    const status = 200;
    return { status };
  } else {
    return { status: 404 }
  }
}

// Contact got problem???
async function updateName(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL update_user_first_last_name($1, $2, $3)' ,
      [req.body.nric, req.body.new_last_name, req.body.new_first_name]
    );
    // const data = helper.emptyOrRows(rows);
    const status = 200;
    return { status };
  } else {
    return { status: 404 };
  }
}

async function updateContactNumber(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL update_contact_number($1, $2)' ,
      [req.body.nric, req.body.new_contact_number]
    );
    // const data = helper.emptyOrRows(rows);
    const status = 200;
    return { status };
  } else {
    return { status: 404 }
  }
}

async function addAddress(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL add_user_address($1, $2, $3, $4, $5)' ,
      [req.body.nric, req.body.street_name, req.body.unit_number, req.body.zip_code, req.body.area]
    );
    const data = helper.emptyOrRows(rows);
    const status = 200;
    return { data, status };
  } else {
    return { status: 404 };
  }
}

async function updateAddress(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL update_address($1, $2, $3, $4, $5)' ,
      [req.body.nric, req.body.new_street_name, req.body.new_unit_number, req.body.new_zip_code, req.body.new_area]
    );
    const data = helper.emptyOrRows(rows);
    const status = 200;
    return { data, status };
  } else {
    return { status: 404 };
  }
}

async function updatePartiallyVaccinated(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL update_vaccination_status_to_partially($1)' ,
      [req.body.curr_nric]
    );
    const data = helper.emptyOrRows(rows);
    const status = 200;
    return { data, status };
  } else {
    return { status: 404 };
  }
}

async function updateFullyVaccinated(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 1) {
    const rows = await db.query(
      'CALL update_vaccination_status_to_fully($1)' ,
      [req.body.curr_nric]
    );
    const data = helper.emptyOrRows(rows);
    const status = 200;
    return { data, status };
  } else {
    return { status: 404 };
  }
}

async function uploadTestResults(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  // const nric = decoded["nric"];
  if (account_role == 2) {
    const rows = await db.query(
      'CALL add_covid19_results($1, $2, $3)' ,
      [req.body.nric, req.body.covid19_test_type, req.body.test_result]
    );
    const status = 200;
    return { status };
  } else {
    return { status: 404 };
  }
}

async function getTestHistory(req) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const nric = decoded["nric"];
  const account_role = decoded["account_role"];
  if (account_role == 3) {
    const rows = await db.query(
      `SELECT nric, 
      pgp_sym_decrypt(covid19_test_type::bytea,'${process.env.SECRET_KEY}') as covid19_test_type,
      pgp_sym_decrypt(test_result::bytea,'${process.env.SECRET_KEY}') as test_result,
      test_date, test_id 
      FROM covid19_test_results where nric = $1`, [nric]
    );
    const data = helper.emptyOrRows(rows);
    return { data };
  } else {
    return { status: 404 }
  }
}

async function uploadDeclaration(req) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const nric = decoded["nric"];
    const account_role = decoded["account_role"];
    console.log()
    if (account_role == 3) {
      const rows = await db.query(
        'CALL add_health_declaration($1, $2, $3)' ,
        [nric, req.body.covid_symptoms, req.body.temperature]
      );
      const status = 200;
      return { status };
    } else {
      return { status: 404 }
    }
}

async function getDeclarationHistory(req) {
    //const offset = helper.getOffset(page, config.listPerPage);
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const nric = decoded["nric"];
    const account_role = decoded["account_role"];
    if (account_role == 3) {
      const rows = await db.query(
        `SELECT nric, declaration_date, health_declaration_id,
        pgp_sym_decrypt(covid_symptoms::bytea,'${process.env.SECRET_KEY}') as covid_symptoms,
        pgp_sym_decrypt(temperature::bytea,'${process.env.SECRET_KEY}') as temperature
        FROM health_declaration 
        where nric = $1`, [nric]
      );
      const data = helper.emptyOrRows(rows);
      return { data };
    } 
    // else if (account_role == 2) {
    //   const rows = await db.query(
    //     `SELECT nric, declaration_date, health_declaration_id,
    //     pgp_sym_decrypt(covid_symptoms::bytea,'${process.env.SECRET_KEY}') as covid_symptoms,
    //     pgp_sym_decrypt(temperature::bytea,'${process.env.SECRET_KEY}') as temperature
    //     FROM health_declaration `, []
    //   );
    //   const data = helper.emptyOrRows(rows);
    //   //const meta = { page };
    //   return { data };
    // } 
    else {
      return { status : 404 }
    }
}

async function getRecordLogs(req) {
    //const offset = helper.getOffset(page, config.listPerPage);
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const account_role = decoded["account_role"];
    if (account_role == 1) {
      const rows = await db.query(
        'SELECT * FROM record_logs' ,
        []
      );
      // console.log('print:', rows[0])
      const data = helper.emptyOrRows(rows);
      //const meta = { page };
      return {
        data
      }
    } else {
      return { status: 404 }
    }
}

async function uploadVaccinationStatus(req) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const account_role = decoded["account_role"];
    if (account_role == 2) {
      const rows = await db.query(
        'CALL add_vaccination_results($1, $2, $3, $4, $5, $6)' ,
        [req.body.nric, req.body.vaccination_status, req.body.vaccine_type, req.body.vaccination_centre_location, req.body.first_dose_date, req.body.second_dose_date]
      );
      const status = 200;
       return { status };
    } else {
      return { status : 404 }
    }
}

async function getVaccinationStatus(req) {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const nric = decoded["nric"];
    const rows = await db.query(
        'SELECT * FROM vaccination_results where nric = $1', [nric]
    );
    // console.log('print:', rows[0])
    const data = helper.emptyOrRows(rows);
    // const meta = { page };
    return {
        data
    }
}

async function getDashboard(req) {
  //const offset = helper.getOffset(page, config.listPerPage);
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 2) {
    const rows = await db.query(
      `SELECT vaccination_results.nric,
      pgp_sym_decrypt(temperature::bytea,'${process.env.SECRET_KEY}') as temperature,
      pgp_sym_decrypt(first_dose_date::bytea,'${process.env.SECRET_KEY}') as first_dose_date,
      pgp_sym_decrypt(second_dose_date::bytea,'${process.env.SECRET_KEY}') as second_dose_date,
      pgp_sym_decrypt(covid_symptoms::bytea,'${process.env.SECRET_KEY}') as covid_symptoms
      FROM vaccination_results 
      INNER JOIN health_declaration ON (vaccination_results.nric = health_declaration.nric)` ,
      []
  );
  // console.log('print:', rows[0])
  const data = helper.emptyOrRows(rows);
  //const meta = { page };
  return {
      data
  }
  } else {
    return { status: 404 }
  }
}

async function query(req) {
  // const offset = helper.getOffset(page, config.listPerPage);
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const account_role = decoded["account_role"];
  if (account_role == 3) {
    const rows = await db.query(
      `SELECT * FROM public_data 
      where area = $1 AND gender = $2 AND age = $3`, 
      [req.body.area, req.body.gender, req.body.age]
    );
  // console.log('print:', rows[0])
  const data = helper.emptyOrRows(rows);
  //const meta = { page };
    return {
        data,
        length: data.length
    }
  } else {
    return { status: 404 };
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
  getProfile,
  query,
  updatePartiallyVaccinated,
  updateFullyVaccinated,
  getAddress,
  getOneProfile
}