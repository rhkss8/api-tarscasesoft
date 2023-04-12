/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./plan.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var router = express.Router();

router.get('/', auth.isAuthenticated('admin'), controller.index);
router.get('/helloDashboard', controller.helloDashboard);
router.get('/dashboard', controller.dashboard);
router.get('/:id', auth.isAuthenticated('admin'), controller.one);
router.get('/:id/product', controller.product);
router.post('/', multipartMiddleware, controller.create);
router.delete('/:id', auth.isAuthenticated('admin'), controller.delete);
router.put('/order', multipartMiddleware, controller.order);
router.put('/:id', multipartMiddleware, controller.update);
router.put('/:id/status', auth.isAuthenticated('admin'), controller.status);
router.put('/:id/products', auth.isAuthenticated('admin'), controller.updateProducts);

module.exports = router;
