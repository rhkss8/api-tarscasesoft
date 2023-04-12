/**
 * Created by rhkss8 on 2016. 8. 30..
 */
'use strict';

var express = require('express');
var controller = require('./user.controller.js');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var multer = require('multer');

var router = express.Router();


router.get('/list', controller.list);
router.get('/token', auth.isAuthenticated(), controller.email);
router.post('/', controller.create);
router.put('/admin/user/status', auth.hasRole('admin'), controller.status);
router.get('/dealer/info', controller.selectDealer);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:id/one', auth.isAuthenticated(), controller.selectOne);
router.put('/:id/biz/change', auth.isAuthenticated(), controller.bizChange);
router.put('/:id/edit', multipartMiddleware, controller.edit);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/password/admin', auth.isAuthenticated('admin'), controller.resetPassword);
router.put('/:id/role', auth.isAuthenticated('admin'), controller.role);
router.get('/:id/info', controller.selectOne);


router.get('/', auth.isAuthenticated(), controller.index);
router.get('/user', auth.isAuthenticated(), controller.user);
router.get('/:id/consultantView', controller.consultantView);
router.get('/count', controller.count);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);


router.post('/findId', controller.findId);
router.post('/findPass', controller.findPass);
router.post('/findPassHelloMyCar', controller.findPassHelloMyCar);
router.put('/:id/updateInfo', auth.isAuthenticated(), controller.update);
router.put('/:id/ban', auth.isAuthenticated(), controller.ban);
router.put('/:id/blog', auth.isAuthenticated(), controller.blog);
router.put('/:id/sale', auth.isAuthenticated(), controller.sale);
router.put('/:id/writer', auth.isAuthenticated(), controller.writer);

module.exports = router;

