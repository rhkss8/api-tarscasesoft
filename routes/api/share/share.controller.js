/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Utils = require('../../../config/utils');
var _ = require('lodash');
var
  Product = require('../product/product.model'),
  Board = require('../board/board.model'),
  path = require('path'),
  dateFormat = require('dateformat'),
  date = new Date();


/**
 * 차량 공유 server side rendering
 * @param req
 * @param res
 */
exports.index = function (req, res) {
  Product.findById(req.query.i, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: 1001});

    var return_url;

    if(req.get('host').indexOf('localhost') >= 0){
      return_url = 'http://localhost:9030/app/car-detail/home?s=true&i=' + req.query.i;
    } else {
      return_url = 'https://m.yeoungcha.com/app/car-detail/home?s=true&i=' + req.query.i;
    }

    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var year = result.year.toString().substring(2,4);

    var params = {
      title: result.name,
      keywords : '영차, 중고차, 실매물, 유투브, 무사고차량 ' + result.name,
      desc: '가격 : ' + numberWithCommas(result.price) + '만원 | 주행거리 : ' + numberWithCommas(result.distance) + 'km | 연식 : ' + year + '년 ' + result.month +'월',
      image : (result && result.photo && result.photo.front && result.photo.front.thumb_url)||"",
      return_url : return_url,
      this_url : req.protocol +'://' +req.get('host') + req.originalUrl
    };

    if(params.image){
      _.extend(params,{image : params.image + '?v=' + new Date().getTime()});
    }

    // var params = {
    //   title: '현대 아반떼 AD 1.6 T-GDi 스포츠 오리지널',
    //   desc: '가격 : 1,720만원 | 주행거리 : 31,264km | 연식 : 16년 9월',
    //   image : 'https://image.yeoungcha.com/product/20190306/5c89d558634c6aee354c7f2f/back-org_2019030613653_ryW-PBLDwV_blob?v=1559739657641',
    //   return_url : 'https://m.yeoungcha.com/app/car-detail/home?s=true&i=5c89f241634c6aee354c7f3c',
    //   this_url : 'https://yeoungcha.com/share?i=5c89f241634c6aee354c7f3c'
    // };

    return res.render('share', params);


    // return res.status(200).json({data: result});
  });

  // res.sendFile(path.join(__dirname,'./share.html'));
};

/**
 * 이벤트 공유 server side rendering
 * @param req
 * @param res
 */
exports.event = function (req, res) {
  Board.findById(req.query.i, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: 1001});

    var return_url;
    if(req.get('host').indexOf('localhost') >= 0){
      return_url = 'http://localhost:9030/event?i=' + req.query.i;
    } else {
      return_url = 'https://m.yeoungcha.com/event?i=' + req.query.i;
    }

    var params = {
      title: result.title,
      desc: '영차 - 중고차도 이젠 영상으로 보고,듣고 확인하세요',
      image : (result && result.mainImage)||"",
      return_url : return_url,
      this_url : req.protocol +'://' +req.get('host') + req.originalUrl
    };

    if(params.image){
      _.extend(params,{image : params.image + '?v=' + new Date().getTime()});
    }

    // var params = {
    //   title: '현대 아반떼 AD 1.6 T-GDi 스포츠 오리지널',
    //   desc: '가격 : 1,720만원 | 주행거리 : 31,264km | 연식 : 16년 9월',
    //   image : 'https://image.yeoungcha.com/product/20190306/5c89d558634c6aee354c7f2f/back-org_2019030613653_ryW-PBLDwV_blob?v=1559739657641',
    //   return_url : 'https://m.yeoungcha.com/app/car-detail/home?s=true&i=5c89f241634c6aee354c7f3c',
    //   this_url : 'https://yeoungcha.com/share?i=5c89f241634c6aee354c7f3c'
    // };

    return res.render('share', params);


    // return res.status(200).json({data: result});
  });

  // res.sendFile(path.join(__dirname,'./share.html'));
};
