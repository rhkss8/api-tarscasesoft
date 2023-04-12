/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./board.controller.js');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.one);
router.get('/contact/user/:id', controller.getContactUser);
router.post('/', auth.isAuthenticated('admin'), controller.create);
router.post('/contact', multipartMiddleware, controller.contactUpload);
router.post('/upload/image', multipartMiddleware, controller.imageUpload);
router.put('/:id', auth.isAuthenticated('admin'), controller.update);
router.put('/:id/status', auth.isAuthenticated('admin'), controller.status);
router.put('/:id/contact/reply', auth.isAuthenticated(), controller.contactReply);
// router.get('/', controller.index);

// router.get('/', controller.index);
// router.post('/', controller.create);
// router.get('/count', controller.count);
// router.get('/:id/home', controller.home);
// router.get('/:id/homeDetail', controller.homeDetail);
// router.get('/userBlog', controller.userBlog);
// router.get('/:id', controller.show);
// router.put('/:id', auth.isAuthenticated(), controller.update);
// router.put('/:id/re', auth.isAuthenticated(), controller.reply);
// router.post('/:id/viewUpdate', controller.viewUpdate);

module.exports = router;
