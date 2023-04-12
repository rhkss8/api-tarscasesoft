/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./add.controller.js');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);

router.get('/countOne', controller.countOne);
router.get('/count', controller.count);
router.get('/order', controller.order);
router.get('/add', controller.add);
router.get('/:id', controller.view);

router.post('/', controller.create);
router.put('/', controller.update);
router.put('/addUpdate', controller.addUpdate);
router.put('/:id/viewUpdate', controller.viewUpdate);



module.exports = router;
