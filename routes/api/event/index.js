/**
 * Created by rhkss8 on 2019. 6. 21..
 */
'use strict';

var express = require('express');
var controller = require('./event.controller');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();

router.get('/', controller.index);
router.get('/:uid', controller.one);
router.get('/contact/user/:id', controller.getContactUser);
router.post('/', multipartMiddleware, controller.create);
router.post('/upload/image', multipartMiddleware, controller.imageUpload);
router.delete('/:id', controller.delete);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/:id/status', auth.isAuthenticated(), controller.status);
router.put('/:id/contact/reply', auth.isAuthenticated(), controller.contactReply);

module.exports = router;
