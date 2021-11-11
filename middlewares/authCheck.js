const jwt = require('jsonwebtoken');
const config = require('../auth_config')
const secret = config.db.secret;
const cryptoJs = require("crypto-js");

function decryptData(data) {
    try {
      const bytes = cryptoJs.AES.decrypt(data, "ifsgrp3ifs4205");
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(cryptoJs.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }

const authCheck = (req, res, next) => {
    if (req.headers.authorization) {
        const token = decryptData(req.headers.authorization);
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                res.send(401);
            }
            else {
                next();
            }
        });
    }
    else {
        res.send(401);
    }
};

module.exports = authCheck;