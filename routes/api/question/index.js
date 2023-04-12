/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./question.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.put('/read', controller.read);
router.put('/read/dealer', controller.readDealer);
router.put('/leave', controller.leave);
router.delete('/:id', controller.delete);

module.exports = router;
