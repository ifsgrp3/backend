const express = require('express');
const router = express.Router();
const records = require('../services/records');
const authCheck = require('../middlewares/authCheck')

/* GET quotes listing. */
// router.get('/', async function(req, res, next) {
//   try {
//     res.json(await auth.getMultiple(req.query.page));
//   } catch (err) {
//     console.error(`Error while logging `, err.message);
//     next(err);
//   }
// });

router.post('/reg', authCheck, async function(req, res, next) {
    try {
        res.json(await records.registration(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/profile', authCheck, async function(req, res, next) {
    try {
        res.json(await records.getProfile(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.put('/update_num', authCheck, async function(req, res, next) {
    try {
        res.json(await records.updateContactNumber(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/address', authCheck, async function(req, res, next) {
    try {
        res.json(await records.addAddress(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.put('/address', authCheck, async function(req, res, next) {
    try {
        res.json(await records.updateAddress(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/upload_test', authCheck, async function(req, res, next) {
    try {
        res.json(await records.uploadTestResults(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/test_history', authCheck, async function(req, res, next) {
    try {
        res.json(await records.getTestHistory(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/upload_declaration', authCheck, async function(req, res, next) {
    try {
        res.json(await records.uploadDeclaration(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/declaration_history', authCheck, async function(req, res, next) {
    try {
        res.json(await records.getDeclarationHistory(req, req.query.page));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/record_logs', authCheck, async function(req, res, next) {
    try {
      res.json(await records.getRecordLogs(req, req.query.page));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.post('/upload_vaccination', authCheck, async function(req, res, next) {
    try {
        res.json(await records.uploadVaccinationStatus(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/vaccination_history', authCheck, async function(req, res, next) {
    try {
      res.json(await records.getVaccinationStatus(req));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.get('/covid_dashboard', authCheck, async function(req, res, next) {
    try {
      res.json(await records.getDashboard(req, req.query.page));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.get('/statistics', authCheck, async function(req, res, next) {
    try {
      res.json(await records.query(req, req.query.page));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.delete('/user', authCheck, async function(req, res, next) {
    try {
      res.json(await records.removeUserParticulars(req));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.put('/user/names', authCheck, async function(req, res, next) {
    try {
      res.json(await records.updateName(req));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

module.exports = router;