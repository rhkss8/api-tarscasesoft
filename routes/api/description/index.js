/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./description.controller.js');

var router = express.Router();

router.get('/:id', controller.index);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;
