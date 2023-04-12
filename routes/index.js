var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('../views/index', { title: '영차' });
  res.sendFile(path.join(__dirname,'../config/views/index.html'));
});

module.exports = router;
