/**
 * Express configuration
 */

'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const path = require('path');
const config = require('./environment');
const passport = require('passport');
const cors = require("cors");
// const session = require('express-session');
// const mongoStore = require('connect-mongo')(session);
// const mongoose = require('mongoose');

const whiteList = ['http://localhost:3000']
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed Origin'))
    }
  },
  credential: true,
  optionsSuccessStatus: 200
}

// mongoose.Promise = global.Promise;

module.exports = function(app) {
  const env = app.get('env');

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(compression());
  // app.use(bodyParser.urlencoded({ extended: false }));
  // app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

  app.use(cors(corsOptions))

  // app.use(session({
  //   secret: config.secrets.session,
  //   resave: true,
  //   saveUninitialized: true,
  //   store: new mongoStore({
  //     mongooseConnection: mongoose.connection,
  //     db: 'car'
  //   })
  // }));

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', path.join(config.root, 'public'));
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    // app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', path.join(config.root, 'client'));
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
