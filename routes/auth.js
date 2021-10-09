const express = require('express');
const router = express.Router();
const auth = require('../services/auth');

/* GET quotes listing. */
router.get('/accs', async function(req, res, next) {
  try {
    res.json(await auth.getCredentials(req.query.page));
  } catch (err) {
    console.error(`Error while logging `, err.message);
    next(err);
  }
});

router.post('/login', async function(req, res, next) {
    try {
        res.json(await auth.login(req.body));
    } catch (err) {
        console.error(`Error while logging `, err.message);
        next(err);
    }
})

router.get('/mfa', async function(req, res, next) {
  try {
      res.json(await auth.mfa());
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.post('/deact_acc', async function(req, res, next) {
  try {
      res.json(await auth.deactivate(req.body));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.post('/act_acc', async function(req, res, next) {
  try {
      res.json(await auth.activate(req.body));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.get('/account_logs', async function(req, res, next) {
  try {
    res.json(await auth.getAccountLogs(req.query.page));
  } catch (err) {
    console.error(`Error while logging `, err.message);
    next(err);
  }
});

module.exports = router;
