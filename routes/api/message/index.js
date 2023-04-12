/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./message.controller.js');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.room);
router.post('/', controller.create);
router.post('/message', controller.message);
router.put('/read', controller.read);
router.put('/leave', controller.leave);

module.exports = router;
