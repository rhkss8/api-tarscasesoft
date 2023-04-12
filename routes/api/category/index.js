/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./category.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/multi', controller.multi);
router.get('/multi/detail', controller.multiDetail);
router.get('/modelType', controller.getModelType);
router.post('/', controller.create);
router.delete('/:id', controller.delete);
router.put('/:id', controller.update);



module.exports = router;
