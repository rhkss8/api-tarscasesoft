const express = require('express');
const router = express.Router();
// var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
//   // res.render('../views/index', { title: '영차' });
//   res.sendFile(path.join(__dirname,'../config/views/index.html'));
  res.send({ connect: 'done'})
});

module.exports = router;
