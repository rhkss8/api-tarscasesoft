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
  var return_url;

  if(req.get('host').indexOf('localhost') >= 0){
    return_url = 'http://localhost:9030/app/home';
  } else {
    return_url = 'https://m.yeoungcha.com/app/home';
  }


  var params = {
    title: '영차 - 유투브로 실매물 인증',
    keywords : '영차, 중고차, 실매물, 유투브, 무사고차량',
    desc: '사진이 아닌 유투브을 통해 차량에 실물을 확인하고 영차로 차량정보를 확인해보세요',
    image : 'images/og-image.jpeg',
    return_url : return_url,
    this_url : req.protocol +'://' +req.get('host') + req.originalUrl
  };

  if(params.image){
    _.extend(params,{image : params.image + '?v=' + new Date().getTime()});
  }

  return res.render('home', params);

};

/**
 * 차량 공유 server side rendering
 * @param req
 * @param res
 */
exports.product = function (req, res) {
  Product.findById(req.query.i, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: 1001});

    var return_url;

    if(req.get('host').indexOf('localhost') >= 0){
      return_url = 'http://localhost:9030/app/car-detail/home?i=' + req.query.i;
    } else {
      return_url = 'https://m.yeoungcha.com/app/car-detail/home?i=' + req.query.i;
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

    return res.render('share', params);

  });

};

