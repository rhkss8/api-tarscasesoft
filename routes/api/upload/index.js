/**
 * Created by rhkss8 on 2016. 9. 2..
 */
'use strict';

var express = require('express');
var controller = require('./upload.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var multer = require('multer');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.post('/', multipartMiddleware, controller.saleInsert);
router.put('/', multipartMiddleware, controller.saleUpdate);
router.post('/blog', multipartMiddleware, controller.blogUpload);
router.post('/user', multipartMiddleware, controller.userUpdate);

module.exports = router;
