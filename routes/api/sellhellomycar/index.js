/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./sellhellomycar.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
router.get('/naslog',auth.isAuthenticated(), controller.getNasLog);
router.get('/buy',auth.isAuthenticated(), controller.getBuy);
router.get('/rent',auth.isAuthenticated(), controller.getRent);
router.post('/', controller.create);
router.post('/buy', controller.buy);
router.post('/rent', controller.rent);

module.exports = router;
