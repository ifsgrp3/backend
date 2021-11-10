var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

var indexRouter = require('./routes/index');
var quotesRouter = require('./routes/quotes');
var authRouter = require('./routes/auth');
var recordsRouter = require('./routes/records');
const https = require('https');
const fs = require('fs');

var app = express();

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
// const options = {
//    key: fs.readFileSync('key.pem'),
//    cert: fs.readFileSync('cert.pem')
//  };

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions)) // Use this after the variable declaration

app.use('/', indexRouter);
// app.use('/quotes', quotesRouter);
app.use('/auth', authRouter);
app.use('/records', recordsRouter);

// var httpsServer = https.createServer(options, app);
// httpsServer.listen(8000);

module.exports = app;