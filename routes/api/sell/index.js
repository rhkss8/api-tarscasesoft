/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./sell.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.one);
router.post('/add', multipartMiddleware, controller.createSell);

module.exports = router;
