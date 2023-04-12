'use strict';
//로그인할때 사용됨
var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var crypto = require('crypto');
var Log = require('log')
    , log = new Log('info');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {

    var error = err || info;
    log.info(error);
    if (error) return res.status(403).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)
});

router.post('/dealer', function(req, res, next) {
  //TODO 해당 sha1 으로 비밀번호 넘어온거 디코드 해서 하는걸로 변경해야함
  // if(req.body.password){
  //     var encrypt = crypto.pbkdf2Sync(req.body.password).toString('base64');
  //     console.log(encrypt);
  //
  //     _.extend(req.body,{password : encrypt});
  // }

  passport.authenticate('local', function (err, user, info) {

    var error = err || info;
    if (error) return res.status(400).json({err : {code : 1, message : error.message||'LOGIN_FAIL'}});
    if (!user) return res.status(400).json({err : {code : 1}});
    if('dealer' !== user.role && 'admin' !== user.role && 'team' !== user.role) return res.status(403).json({err : {code : 8, message : 'ACCESS_DENY'}});
    if(user.status.val === '301') return res.status(403).json({err : {code : 9, message : 'ACCOUNT_NOT_CONFIRM'}});
    if(user.status.val !== '201') return res.status(403).json({err : {code : 10, message : 'ACCOUNT_DENIED'}});

    var token = auth.signToken(user._id, user.role);
    res.json({data :
        {token: token,
         account : {
             account_id: user._id,
             loginDate: user.loginDate,
             email: user.email,
             name: user.name,
             phone: user.phone,
             photo: user.photo,
             role : user.role
          }
        }
    });
  })(req, res, next)
});

router.post('/web', function(req, res, next) {
  //TODO 해당 sha1 으로 비밀번호 넘어온거 디코드 해서 하는걸로 변경해야함
  // if(req.body.password){
  //     var encrypt = crypto.pbkdf2Sync(req.body.password).toString('base64');
  //     console.log(encrypt);
  //
  //     _.extend(req.body,{password : encrypt});
  // }

  passport.authenticate('local', function (err, user, info) {

    var error = err || info;
    if (error) return res.status(400).json({err : {code : 1, message : error.message||'LOGIN_FAIL'}});
    if (!user) return res.status(400).json({err : {code : 1}});
    if(user.status.val === '301') return res.status(403).json({err : {code : 9, message : 'ACCOUNT_NOT_CONFIRM'}});
    if(user.status.val !== '201') return res.status(403).json({err : {code : 10, message : 'ACCOUNT_DENIED'}});

    var token = auth.longToken(user._id, user.role);
    res.json({data :
      {token: token,
        account : {
          account_id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          photo: user.photo,
          role : user.role,
          gender : user.gender,
          alarm : user.alarm
        }
      }
    });
  })(req, res, next)
});

module.exports = router;
