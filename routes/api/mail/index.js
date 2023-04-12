/**
 * Created by rhkss8 on 2019. 6. 21..
 */
'use strict';

var express = require('express');
var controller = require('./mail.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/crwaling', controller.crwaling);

module.exports = router;
