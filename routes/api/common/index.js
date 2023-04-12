/**
 * Created by rhkss8 on 2016. 9. 2..
 */
'use strict';

var express = require('express');
var controller = require('./common.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/dashboard', auth.isAuthenticated(), controller.dashboard);

module.exports = router;
