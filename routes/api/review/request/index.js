/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./request.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/count', controller.count);

router.get('/:id', controller.view);
router.get('/:id/getMessage', controller.getMessage);
router.get('/:id/sendMessage', controller.sendMessage);
router.get('/:id/deleteMessage', controller.deleteMessage);
router.post('/', controller.create);
router.post('/update', controller.update);



module.exports = router;
