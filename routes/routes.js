/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var express = require('express');
module.exports = function(app) {

  // main homepage
  app.use('/', require('./index'));

  // seo setting
  app.use('/share', require('./api/share'));
  app.use('/home', require('./api/home'));

  // api setting
  app.use('/yeoungcha/board', require('./api/board'));
  app.use('/yeoungcha/category', require('./api/category'));
  app.use('/yeoungcha/description', require('./api/description'));
  app.use('/yeoungcha/event', require('./api/event'));
  app.use('/yeoungcha/plan', require('./api/plan'));
  app.use('/yeoungcha/product', require('./api/product'));
  app.use('/yeoungcha/review', require('./api/review'));
  app.use('/yeoungcha/users', require('./api/users'));
  app.use('/yeoungcha/message', require('./api/message'));
  app.use('/yeoungcha/dashboard', require('./api/dashboard'));
  app.use('/yeoungcha/question', require('./api/question'));
  app.use('/yeoungcha/sell', require('./api/sell'));
  app.use('/yeoungcha/sellhellomycar', require('./api/sellhellomycar'));//안녕마이카내차팔기서비스

  // app.use('/api/users', require('./api/users'));
  // app.use('/api/sale', require('./api/sale'));
  // app.use('/api/upload', require('./api/upload'));
  // app.use('/api/blog', require('./api/blog'));
  // app.use('/api/common', require('./api/common'));
  // app.use('/api/message', require('./api/message'));
  // app.use('/api/request', require('./api/request'));
  // app.use('/api/add', require('./api/add'));
  // app.use('/api/qna', require('./api/qna'));
  // app.use('/api/coupon', require('./api/coupon'));
  // app.use('/api/video', require('./api/video'));

  app.use('/auth', require('./auth'));//admin 용
  app.use('/yeoungcha/auth', require('./auth'));//webapp 용

  app.use('/sellhellomycar', require('./api/sellhellomycar'));//안녕마이카내차팔기서비스

};
