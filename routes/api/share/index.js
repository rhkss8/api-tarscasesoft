/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var express = require('express');
var controller = require('./share.controller');


var router = express.Router();

router.get('/', controller.index);
router.get('/event', controller.event);


module.exports = router;
