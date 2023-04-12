/**
 * Created by rhkss8 on 2019. 9. 16..
 * for seo setting
 */
'use strict';

var express = require('express');
var controller = require('./home.controller');


var router = express.Router();

router.get('/', controller.index);
router.get('/product', controller.product);


module.exports = router;
