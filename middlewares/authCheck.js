const jwt = require('jsonwebtoken');
const config = require('../auth_config')
const secret = config.db.secret;

const authCheck = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization;
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