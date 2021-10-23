const express = require('express');
const router = express.Router();
const auth = require('../services/auth');
const authCheck = require('../middlewares/authCheck')

/* GET quotes listing. */
router.get('/accs', authCheck, async function(req, res, next) {
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

router.post('/register', async function(req, res, next) {
  try {
      res.json(await auth.registration(req.body));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.get('/mfa', async function(req, res, next) {
  try {
      res.json(await auth.mfa(req));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.post('/acc/deact', authCheck, async function(req, res, next) {
  try {
      res.json(await auth.deactivate(req.body));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.post('/acc/act', authCheck, async function(req, res, next) {
  try {
      res.json(await auth.activate(req.body));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.get('/acc/logs', authCheck, async function(req, res, next) {
  try {
    res.json(await auth.getAccountLogs(req.query.page));
  } catch (err) {
    console.error(`Error while logging `, err.message);
    next(err);
  }
});

module.exports = router;
