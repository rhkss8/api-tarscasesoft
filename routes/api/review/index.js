/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./review.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.one);
router.get('/dealer/:id/count', controller.count);
// router.post('/', auth.isAuthenticated('admin'), controller.create);
router.post('/add', multipartMiddleware, controller.createReview);
// router.post('/upload/image', multipartMiddleware, controller.imageUpload);
router.put('/:id', auth.isAuthenticated('admin'), controller.update);
router.put('/:id/view/update', controller.viewUpdate);
router.put('/:id/status', auth.isAuthenticated('admin'), controller.status);

module.exports = router;
