const express = require('express');
const router = express.Router();
const auth = require('../services/auth');
const authCheck = require('../middlewares/authCheck')

/* GET quotes listing. */
router.get('/accs', authCheck, async function(req, res, next) {
  try {
    res.json(await auth.getCredentials(req));
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

router.get('/logout', async function(req, res, next) {
  try {
      res.json(await auth.login(req));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.post('/register', authCheck, async function(req, res, next) {
  try {
      res.json(await auth.registration(req));
  } catch (err) {
      console.error(`Error while logging `, err.message);
      next(err);
  }
})

router.get('/mfa', authCheck, async function(req, res, next) {
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
    res.json(await auth.getAccountLogs(req));
  } catch (err) {
    console.error(`Error while logging `, err.message);
    next(err);
  }
});

router.get('/items', authCheck, async function(req, res, next) {
  try {
    res.json(await auth.getMenuItems(req));
  } catch (err) {
    console.error(`Error while logging `, err.message);
    next(err);
  }
});

module.exports = router;
