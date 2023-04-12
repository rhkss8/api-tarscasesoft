/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./dashboard.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/badge', controller.badge);
router.get('/badge/dealer', controller.badgeDealer);
router.get('/:id/dealer/active-count', controller.dealerActiveCount);

module.exports = router;
