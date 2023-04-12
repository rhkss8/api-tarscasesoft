/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./blog.controller.js');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.get('/count', controller.count);
router.get('/:id/home', controller.home);
router.get('/:id/homeDetail', controller.homeDetail);
router.get('/userBlog', controller.userBlog);
router.get('/:id', controller.show);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/:id/re', auth.isAuthenticated(), controller.reply);
router.post('/:id/viewUpdate', controller.viewUpdate);

module.exports = router;
