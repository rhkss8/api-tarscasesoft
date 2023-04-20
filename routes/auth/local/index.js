'use strict';
//로그인할때 사용됨
const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const crypto = require('crypto');
const Log = require('log');

const router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {

    const error = err || info;
    if (error) return res.status(403).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    const token = auth.signToken(user._id, user.role);
    res.json({token: token, name: user.name, role: user.role });
  })(req, res, next)
});

router.post('/dealer', function(req, res, next) {
  //TODO 해당 sha1 으로 비밀번호 넘어온거 디코드 해서 하는걸로 변경해야함
  // if(req.body.password){
  //     const encrypt = crypto.pbkdf2Sync(req.body.password).toString('base64');
  //     console.log(encrypt);
  //
  //     _.extend(req.body,{password : encrypt});
  // }

  passport.authenticate('local', function (err, user, info) {

    const error = err || info;
    if (error) return res.status(400).json({err : {code : 1, message : error.message||'LOGIN_FAIL'}});
    if (!user) return res.status(400).json({err : {code : 1}});
    if('dealer' !== user.role && 'admin' !== user.role && 'team' !== user.role) return res.status(403).json({err : {code : 8, message : 'ACCESS_DENY'}});
    if(user.status.val === '301') return res.status(403).json({err : {code : 9, message : 'ACCOUNT_NOT_CONFIRM'}});
    if(user.status.val !== '201') return res.status(403).json({err : {code : 10, message : 'ACCOUNT_DENIED'}});

    const token = auth.signToken(user._id, user.role);
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
  //     const encrypt = crypto.pbkdf2Sync(req.body.password).toString('base64');
  //     console.log(encrypt);
  //
  //     _.extend(req.body,{password : encrypt});
  // }

  passport.authenticate('local', function (err, user, info) {

    const error = err || info;
    if (error) return res.status(400).json({err : {code : 1, message : error.message||'LOGIN_FAIL'}});
    if (!user) return res.status(400).json({err : {code : 1}});
    if(user.status.val === '301') return res.status(403).json({err : {code : 9, message : 'ACCOUNT_NOT_CONFIRM'}});
    if(user.status.val !== '201') return res.status(403).json({err : {code : 10, message : 'ACCOUNT_DENIED'}});

    const token = auth.longToken(user._id, user.role);
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
