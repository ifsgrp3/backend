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
        res.json(await records.registration(req.body));
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
        res.json(await records.updateContactNumber(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/address', authCheck, async function(req, res, next) {
    try {
        res.json(await records.addAddress(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.put('/address', authCheck, async function(req, res, next) {
    try {
        res.json(await records.updateAddress(req.body));
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
        res.json(await records.getDeclarationHistory(req));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/record_logs', authCheck, async function(req, res, next) {
    try {
      res.json(await records.getRecordLogs(req.query.page));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.post('/upload_vaccination', authCheck, async function(req, res, next) {
    try {
        res.json(await records.uploadVaccinationStatus(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/vaccination_history', authCheck, async function(req, res, next) {
    try {
      res.json(await records.getVaccinationStatus(req.body));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.get('/covid_dashboard', authCheck, async function(req, res, next) {
    try {
      res.json(await records.getDashboard(req.query.page));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

module.exports = router;