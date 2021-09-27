const express = require('express');
const router = express.Router();
const records = require('../services/records');

/* GET quotes listing. */
// router.get('/', async function(req, res, next) {
//   try {
//     res.json(await auth.getMultiple(req.query.page));
//   } catch (err) {
//     console.error(`Error while logging `, err.message);
//     next(err);
//   }
// });

router.post('/reg', async function(req, res, next) {
    try {
        res.json(await records.registration(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/upload_test', async function(req, res, next) {
    try {
        res.json(await records.uploadTestResults(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/test_history', async function(req, res, next) {
    try {
        res.json(await records.getTestHistory(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/upload_declaration', async function(req, res, next) {
    try {
        res.json(await records.uploadDeclaration(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.post('/declaration_history', async function(req, res, next) {
    try {
        res.json(await records.getDeclarationHistory(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/record_logs', async function(req, res, next) {
    try {
      res.json(await records.getRecordLogs(req.query.page));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

router.post('/upload_vaccination', async function(req, res, next) {
    try {
        res.json(await records.uploadVaccinationStatus(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/covid_dashboard', async function(req, res, next) {
    try {
      res.json(await records.getVaccinationStatus(req.query.page));
    } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
    }
});

module.exports = router;