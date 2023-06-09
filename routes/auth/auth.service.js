'use strict';

const mongoose = require('mongoose');
const passport = require('passport');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const compose = require('composable-middleware');
const User = require('../api/users/user.model');
const validateJwt = expressJwt({ secret: config.secrets.session });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }

      if(req.body && req.body.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.body.access_token;
      }

      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send({err : {code : -10002, message : 'Unauthorized'}});

        req.user = user;
        next();
      });
    }).use(function (err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        const e = [];
        e.push(err);
        return res.status(401).send({err : {code : -7, message : 'UnauthorizedError'}});
      }
    });
}

// function isUploadAuthenticated() {
//     console.log('upload auth')
//     return compose()
//     // Validate jwt
//         .use(function(req, res, next) {
//             console.log(req.query.hasOwnProperty('ckCsrfToken'))
//             // allow access_token to be passed through query parameter as well
//             if(req.query && req.query.hasOwnProperty('ckCsrfToken')) {
//                 req.headers.authorization = 'Bearer ' + req.query.access_token;
//             }
//             validateJwt(req, res, next);
//         })
//         // Attach user to request
//         .use(function(req, res, next) {
//             console.log('find user')
//             User.findById(req.user._id, function (err, user) {
//                 if (err) return next(err);
//                 if (!user) return res.status(401).send('Unauthorized');
//
//                 req.user = user;
//                 next();
//             });
//         }).use(function (err, req, res, next) {
//             if (err.name === 'UnauthorizedError') {
//                 const e = [];
//                 e.push(err);
//                 return res.status(401).send(e);
//             }
//         });
// }

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.status(403).send({err : {code : -8, message : 'ACCESS DENY'}});
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresIn: config.secrets.session.tokenTime });
}

function longToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresIn: '365d' });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  const token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
// exports.isUploadAuthenticated = isUploadAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.longToken = longToken;
exports.setTokenCookie = setTokenCookie;
