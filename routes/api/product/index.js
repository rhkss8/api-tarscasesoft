/**
 * Created by rhkss8 on 2016. 9. 2..
 */
'use strict';

var express = require('express');
var controller = require('./product.controller');
var config = require('../../../config/environment');
var auth = require('../../auth/auth.service');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var multer = require('multer');

var router = express.Router();

router.get('/:id/account', auth.isAuthenticated(), controller.listAll);//dealer 전용 목록가져오기
router.get('/car_num', auth.isAuthenticated(), controller.carNum);
router.get('/list', controller.list);// 전체전용 목록가져오기
router.get('/search', controller.search);// 검색전용
router.get('/list/multi', controller.multi);// ids 목록가져오기
router.get('/:id/detail', controller.detail);// 전체전용 목록가져오기
router.get('/dealer/:id/product', controller.dealerProducts);//딜러 매물 가져오기
router.get('/all', auth.hasRole('admin'), controller.search);//관리자 전용 목록가져오기
router.get('/count/all', auth.hasRole('admin'), controller.countAll);//관리자 전용 카운트 가져오기
router.get('/:id', auth.isAuthenticated(), controller.one);
router.get('/:id/account/count/all', auth.isAuthenticated(), controller.count);
router.get('/perform/:id', controller.getPerform);
router.post('/', multipartMiddleware, controller.insert);
router.post('/perform', multipartMiddleware, controller.insertPerform);
router.put('/:id', multipartMiddleware, controller.edit);
router.put('/perform/:id', multipartMiddleware, controller.editPerform);
router.put('/:id/status', auth.isAuthenticated(), controller.status);//dealer 전용 상태변경
router.put('/:id/admin/status', auth.hasRole('admin'), controller.status);//관리자 전용 상태변경

module.exports = router;
