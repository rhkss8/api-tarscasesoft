/**
 * Created by rhkss8 on 2016. 9. 2..
 */
'use strict';
var mongoose = require('mongoose');
var
  Product = require('./product.model'),
  Perform = require('./perform.model'),
  Review = require('./../review/review.model'),
  Question = require('./../question/question.model'),
  Project = require('../../../config/default.project'),
  async = require('async'),
  dateFormat = require('dateformat'),
  date = new Date(),
  _ = require('lodash');
var Utils = require('../../../config/utils');
var request = require('request');

/**
 * 상품목록 가져오기 for-dealer
 * @param req
 * @param res
 */
exports.list = function (req, res) {
  var sort = {};
  var match = {};
  var q = Utils.isJson(req.query.where)||{};
  var limit = parseInt(req.query.limit);
  var skip = parseInt(req.query.offset);

  if (q.uid)
    match.uid = mongoose.Types.ObjectId(q.uid);

  if(q.price){
    match.price = {
      $gte : parseInt(q.price.min),
      $lte : parseInt(q.price.max)
    }
  }

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {modDate: -1};

  if (q.car_num)
    match.car_num = new RegExp(q.car_num, 'i');

  var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "writer"};

  var projects = Project.product;

  async.waterfall([
    function getItems(cb) {
      Product.aggregate(
        {$match: match}
        , {$skip: skip}
        , {$limit: limit}
        , {$lookup: writerLookup}
        , {$project: projects}
        , {$sort: sort}
      ).exec(function (err, products) {
        if (err) return cb(err);
        else cb(null, products);
      });
    }, function getCount(products, cb) {
      Product.count(match).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: products, count: count});
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

/**
 * 상품목록 가져오기 검색전용
 * @param req
 * @param res
 */
exports.search = function (req, res) {
  var sort = {};
  var match = {};
  var q = req.query;
  var limit = parseInt(req.query.limit);
  var skip = parseInt(req.query.offset);

  var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "writer"};

  var projects = Project.product;

  async.waterfall([
    function buildOption(cb) {
      if (q.where){
        _.extend(match,q.where);
      }

      //차량번호 조건
      if (q.car_num)
        match.car_num = new RegExp(q.car_num, 'i');

      //카테고리 조건
      if(q.brand_ids){
        var cate_key = 'category.brand';

        var ids = [];
        q.brand_ids.forEach(function (val) {
          ids.push(mongoose.Types.ObjectId(val));
        });

        match[cate_key] = {'$in' : ids};
      }

      if(q.model_ids){
        var cate_key = 'category.model';

        var ids = [];
        q.model_ids.forEach(function (val) {
          ids.push(mongoose.Types.ObjectId(val));
        });

        match[cate_key] = {'$in' : ids};
      }

      if(q.model_detail_ids){
        var cate_key = 'category.model_detail';

        var ids = [];
        q.model_detail_ids.forEach(function (val) {
          ids.push(mongoose.Types.ObjectId(val));
        });

        match[cate_key] = {'$in' : ids};
      }

      if(q.grade_ids){
        var cate_key = 'category.grade';

        var ids = [];
        q.grade_ids.forEach(function (val) {
          ids.push(mongoose.Types.ObjectId(val));
        });

        match[cate_key] = {'$in' : ids};
      }

      //거리조건
      if(q.min_distance || q.max_distance){
        match.distance = {};
        if(q.min_distance) _.extend(match.distance,{$gte : parseInt(q.min_distance)*10000});
        if(q.max_distance) _.extend(match.distance,{$lte : parseInt(q.max_distance)*10000});
      }

      //가격조건
      if(q.min_price || q.max_price){
        match.price = {};
        if(q.min_price) _.extend(match.price,{$gte : parseInt(q.min_price)*100});
        if(q.max_price) _.extend(match.price,{$lte : parseInt(q.max_price)*100});
      }

      //연식 월 조건
      if(q.startDay || q.endDay){
        match.made_year = {};
        if(q.startDay){
          _.extend(match.made_year,{$gte : new Date(q.startDay)});
        }

        if(q.endDay){
          _.extend(match.made_year,{$lte : new Date(q.endDay)});
        }
      }

      if(q.fuel){
        match.fuel = {$in : q.fuel};
      }

      if(q.mission){
        match.mission = {$in : q.mission};
      }

      if(q.colors){
        match.color = {$in : q.colors};
      }

      if(q.types){
        match.model_type = {$in : q.types};
      }

      if(q.options){
        var option_key = 'options.';
        q.options.forEach(function (key) {
          match[option_key+key] = true;
        });
      }

      if(q.city){
        match.city = {$in : q.city};
      }

      if (req.query.sort_name && req.query.sort_order)
        sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
      else
        sort = {modDate: -1};

      cb(null, 'match')
    },
    function getItems(dummy, cb) {
      console.log(match)
      Product.aggregate(
        {$match: match}
        , {$sort: sort}
        , {$skip: skip}
        , {$limit: limit}
        , {$lookup: writerLookup}
        ,{ "$unwind": {path : "$writer" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
        , {$project: projects}
      ).exec(function (err, products) {
        if (err) return cb(err);
        else cb(null, products);
      });
    }, function getCount(products, cb) {
      Product.count(match).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: products, count: count});
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

/**
 * 상품 목록 여러 아이디로 찾기
 * @param req
 * @param res
 */
exports.multi = function (req, res) {
  var match = Utils.isJson(req.query);
  var where = {};

  if(!match.ids || match.ids.length <= 0) return res.status(200).json({data: []});

  if(match.ids){


    _.extend(where, {
      '_id' : {'$in' : match.ids||[]}
    });
  }

  Product.find(where, function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });

};

exports.detail = function (org_req, org_res) {
  var match = {};

  if (org_req.params.id)
    match._id = mongoose.Types.ObjectId(org_req.params.id);

  var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "writer"};

  var projects = Project.product;


  async.waterfall([
    function getProduct(cb) {
      Product.aggregate(
        {$match: match}
        ,{$lookup: writerLookup}
        ,{$project: projects}
      )
      .exec(function (err, products) {
        if (err) return cb(err);
        else cb(null, products[0]);
      });
    },
    function checkYoutubeKey(product, cb) {
      if(!product.video_url) return cb(null, product);
      console.log('rest::getJSON',!!product.video_url);

      var video_key;

      if(!product.video_key) {
        var ytRegExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        var ytMatch = product.video_url.match(ytRegExp);
        var youtubeId = ytMatch[1];
        if (youtubeId) {
          video_key = youtubeId;
        }
      } else video_key = product.video_key;

      var url = 'https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v='+video_key+'&format=json';

      var options = {
        url : url,
        json : true,
        // headers : {'User-Agent': 'request'}
        headers: { 'Content-Type': 'application/json' }
      };
      //
      request.get(options, function(err, res, body){

        if(err) return cb(err);

        //유투브 url 이 존재하는지 체크한다. 재생가능하다면 object 로 리턴됨
        if(typeof body === 'object'){
          return cb(null, product);
        } else {
          Product.update(
            {_id: product._id}
            ,{
              $set: {
                video_url : '',
                video_key : ''
              }
            }).exec(function (err, result) {

              Product.findById(product._id, function (err, result) {
                if(err) return cb(err);

                cb(null, result);
              });

          });
        }
      });

    }
    ,function getSaleCount(product,cb) {
      var match = {
        "uid": mongoose.Types.ObjectId(product.uid)
      };

      Product.aggregate(
        {$match: match}
        , {
          $group: {
            _id: "$status.val",
            count: {$sum: 1}
          }
        }
      )
      .exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {product : product, sale_count : count});
      });
    }
    ,function getReviewCount(result, cb) {
      var match = {
        "did": mongoose.Types.ObjectId(result.product.uid)
      };

      Review.count(match).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {product : result.product, sale_count : result.sale_count, review_count : count});
      });
    }
  ],function (err,result) {
    if (err) return Utils.handleError(org_res, err);
    return org_res.status(200).json({data: result});
  });
};

exports.one = function (req, res) {
  Product.findById(req.params.id, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: 1001});
    return res.status(200).json({data: result});
  });
};

/**
 * 내가 등록한 상품 전체 카운트 가져오기
 * @param req
 * @param res
 */
exports.countAll = function (req, res) {

  Product.aggregate({
    $group: {
      _id: "$status.val",
      count: {$sum: 1}
    }
  })
    .exec(function (err, count) {
      if (err) return Utils.handleError(res, err);

      var all_status = {
        201 : {count : 0},
        301 : {count : 0},
        401 : {count : 0},
        501 : {count : 0},
        601 : {count : 0},
        701 : {count : 0},
        801 : {count : 0}
      };

      count.forEach(function (val) {
        if(all_status[val._id]){
          all_status[val._id].count = val.count;
        }
      });

      return res.status(200).json({data: all_status});
    });
};

/**
 * 내가 등록한 상품 전체 카운트 가져오기
 * @param req
 * @param res
 */
exports.count = function (req, res) {

  var match = {
    "uid": mongoose.Types.ObjectId(req.params.id)
  };

  Product.aggregate(
    {$match: match}
    , {
      $group: {
        _id: "$status.val",
        count: {$sum: 1}
      }
    }
  )
    .exec(function (err, count) {
      if (err) return Utils.handleError(res, err);

      var all_status = {
        201 : {count : 0},
        301 : {count : 0},
        401 : {count : 0},
        501 : {count : 0},
        601 : {count : 0},
        701 : {count : 0}
      };

      count.forEach(function (val) {
        if(all_status[val._id]){
          all_status[val._id].count = val.count;
        }
      });

      return res.status(200).json({data: all_status});
    });
};

/**
 * 차량등록
 * @param req
 * @param res
 * @param next
 */
exports.insert = function (req, res, next) {
  var path, newPath, returnPath;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var product = Utils.isJson(req.body.data);

      var uid = product.uid;
      var param = _.extend(product, {
        uid: mongoose.Types.ObjectId(uid) || {},
        status: {name: "product posted", val: 401}
      });

      Product.create(param, function (err, product) {
        if (err) return cb(err);
        else cb(null, product);
      });
    },
    function uploadFiles(product, cb) {

      var updated;
      path = Utils.getProductFilePath(req, 'product', product._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      var photo = product.photo || {};

      if (Object.keys(req.files).length > 0) {
        Object.keys(req.files).forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = req.files[val];
          var file_type = file.fieldName;
          if (!file_type) return;

          var file_name = file.name = file.fieldName + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
          if (file_type === 'performance_log' || file_type === 'insurance_log') {

            file.dir = returnPath + '/';

            if (!product[file_type] && product[file_type].file) product.performance_log.file = {};

            product[file_type].file.url = returnPath + '/' + file_name;
            product[file_type].file.name = file_name;

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          } else {

            var names = file_type.split('-'); // 0 : 사진종류 , 1: org,thumb 구분

            file.dir = returnPath + '/';

            if (!photo[names[0]]) photo[names[0]] = {};

            if (names[1] === 'org') {
              photo[names[0]].url = returnPath + '/' + file_name;
              photo[names[0]].name = file_name;
            } else {
              photo[names[0]].thumb_url = returnPath + '/' + file_name;
            }

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          }

        });

        updated = _.merge(product.photo, photo);

        cb(null, updated);
      } else cb(null, product);
    }

  ], function (err, updated) {

    if (err) return Utils.handleError(res, err);

    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: updated});
    });

  });

};

/**
 * 차량수정
 * @param req
 * @param res
 * @param next
 */
exports.edit = function (req, res, next) {
  //TODO 파일 삭제된거 디렉토리에서 제거해줘야함
  var path, newPath, returnPath;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var req_body = Utils.isJson(req.body.data);

      Product.findById(req.params.id, function (err, product) {
        if (err) return cb(err);
        if (!product) return cb({err : {code : -10002, message : 'can not find data'}});

        var update = _.extend(req_body, {modDate: Date.now()});
        var updated = _.merge(product, update);

        cb(null, updated);
      });
    },
    function checkVideoRequest(product, cb) {
      if(!product.video_url) return cb(null, product);

      Question.findOne({productId : product._id}).exec(function (err, question) {
        if(err) return cb(err);
        if (!question) return cb(null, product);

        var update = {status : {name : 'video upload', val : 201}, modDate: Date.now()};
        var updated = _.merge(question, update);

        updated.save(function (err, result) {
          cb(null, product);
        });
      });
    },
    function uploadFiles(product, cb) {

      var updated;
      path = Utils.getProductFilePath(req, 'product', product._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      var photo = product.photo || {};

      if (Object.keys(req.files).length > 0) {
        Object.keys(req.files).forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = req.files[val];
          var file_type = file.fieldName;
          if (!file_type) return;

          var file_name = file.name = file.fieldName + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
          if (file_type === 'performance_log' || file_type === 'insurance_log') {

            file.dir = returnPath + '/';

            if (!product[file_type] && product[file_type].file) product.performance_log.file = {};

            product[file_type].file.url = returnPath + '/' + file_name;
            product[file_type].file.name = file_name;

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          } else {

            var names = file_type.split('-'); // 0 : 사진종류 , 1: org,thumb 구분

            file.dir = returnPath + '/';

            if (!photo[names[0]]) photo[names[0]] = {};

            if (names[1] === 'org') {
              photo[names[0]].url = returnPath + '/' + file_name;
              photo[names[0]].name = file_name;
            } else {
              photo[names[0]].thumb_url = returnPath + '/' + file_name;
            }

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          }

        });

        updated = _.merge(product.photo, photo);

        cb(null, updated);
      } else cb(null, product);
    },
    function (updated, cb) {
      updated.save(function (err) {
        if (err) cb(err);
        else cb(null, updated);
      });
    }

  ], function (err, updated) {

    if (err) return Utils.handleError(res, err);

    Product.findById(req.params.id, function (err, product) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: product});
    });

  });

};

/**
 * 차량번호 조회
 * @param req
 * @param res
 */
exports.carNum = function (req, res) {
  if (req.query) {
    var q = Utils.isJson(req.query.where);

    Product.find(q).exec(function (err, products) {
      if (err) return Utils.handleError(res, err);

      return res.status(200).json({data: products.length});
    });
  }
};

/**
 * 차량가져오기 - 관리자용
 * @param req
 * @param res
 */
exports.listAll = function (req, res) {
  var q = Utils.isJson(req.query.where);
  var sort = {};
  var limit = parseInt(req.query.limit);
  var skip = parseInt(req.query.offset);

  if (req.params.id)
    _.extend(q, {uid: mongoose.Types.ObjectId(req.params.id)});

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {modDate: -1};

  if (q.car_num)
    _.extend(q, {car_num: new RegExp(q.car_num, 'i')});


  var updaterLookup = {from: "users", localField: "status_update_uid", foreignField: "_id", as: "updater"};
  var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "writer"};

  var projects = Project.product;

  async.waterfall([
    function getItems(cb) {
      Product.aggregate(
        {$match: q}
        , {$skip: skip}
        , {$limit: limit}
        , {$lookup: updaterLookup}
        , {$lookup: writerLookup}
        , {$project: projects}
        , {$sort: sort}
      ).unwind("writer").exec(function (err, products) {
        if (err) return cb(err);
        else cb(null, products);
      });
    }, function getCount(products, cb) {
      Product.count(q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: products, count: count});
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};


/**
 * 딜러 보유 차량가져오가 - 전체용
 * @param req
 * @param res
 */
exports.dealerProducts = function (req, res) {
  var q = Utils.isJson(req.query.where);
  var sort = {};
  var limit = parseInt(req.query.limit);
  var skip = parseInt(req.query.offset);

  if (req.params.id)
    _.extend(q, {uid: mongoose.Types.ObjectId(req.params.id)});

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {modDate: -1};

  if (q.car_num)
    _.extend(q, {car_num: new RegExp(q.car_num, 'i')});


  var updaterLookup = {from: "users", localField: "status_update_uid", foreignField: "_id", as: "updater"};
  var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "writer"};

  var projects = Project.product;

  async.waterfall([
    function getItems(cb) {
      Product.aggregate(
        {$match: q}
        , {$skip: skip}
        , {$limit: limit}
        , {$lookup: updaterLookup}
        , {$lookup: writerLookup}
        , {$project: projects}
        , {$sort: sort}
      ).exec(function (err, products) {
        if (err) return cb(err);
        else cb(null, products);
      });
    }, function getCount(products, cb) {
      Product.count(q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: products, count: count});
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};
/**
 * 차량 상태 업데이트 - 관리자 전용
 * @param req
 * @param res
 * @param next
 */
exports.status = function (req, res, next) {

  var update_status_name;

  if (req.body.status === 501) {
    update_status_name = 'product reject'
  } else if (req.body.status === 201) {
    update_status_name = 'product add start'
  } else {
    update_status_name = 'no status'
  }

  var update = _.extend(req.body, {
    modDate: Date.now(),
    status: {val: req.body.status, name: update_status_name},
    status_update_uid: mongoose.Types.ObjectId(req.body.status_update_uid)
  });

  Product.findById(req.params.id, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: 1001});
    var updated = _.merge(result, update);

    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: updated});
    });
  });
};

/**
 * 성능기록부 가져오기
 * @param req
 * @param res
 * @param next
 */
exports.getPerform = function (req, res, next) {
  var perform_id = req.params.id;

  Perform.findById(perform_id, function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });
};

/**
 * 성능기록부 등록
 * @param req
 * @param res
 * @param next
 */
exports.insertPerform = function (req, res, next) {
  var path, newPath, returnPath, perform_id, product_id;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var perform = Utils.isJson(req.body.data);

      var param = _.extend(perform, {
        uid: mongoose.Types.ObjectId(perform.uid),
        product_id: mongoose.Types.ObjectId(perform.product_id)
      });

      Perform.create(param, function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    },
    function uploadFiles(perform, cb) {

      var updated;

      perform_id = perform._id;
      product_id = perform.product_id;

      path = Utils.getProductFilePath(req, 'perform', perform._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      var photo = perform.files || {};

      if (Object.keys(req.files).length > 0) {
        Object.keys(req.files).forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = req.files[val];

          var file_name = dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함

          file.dir = returnPath + '/';

          if(!photo[val]) photo[val] = {};
          photo[val].url = returnPath + '/' + file_name;
          photo[val].name = file_name;

          Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
            if (err) return cb(err);
          });

        });

        updated = _.merge(perform.files, photo);

        cb(null, updated);
      } else cb(null, perform);

    },function performUpdate(updated, cb) {
      updated.save(function (err) {
        if (err) cb(err);
        else cb(null, updated);
      });
    }

  ], function (err, updated) {
    if(err) return Utils.handleError(res, err);
    if(!perform_id) return res.status(401).send({err : {code : -10002, message : 'can not find perform_id'}});

    Product.findById(product_id, function (err, product) {
      if (err) return Utils.handleError(res, err);

      _.extend(product.performance_log,{
        db : {name : perform_id}
      });

      product.save(function (err) {
        if (err) return Utils.handleError(res, err);
        return res.status(200).json({data: product});
      });
    });

  });

};

/**
 * 성능점검부 수정
 * @param req
 * @param res
 * @param next
 */
exports.editPerform = function (req, res, next) {
  var path, newPath, returnPath, perform_id, product_id;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var req_body = Utils.isJson(req.body.data);

      Perform.findById(req.params.id, function (err, perform) {
        if (err) return cb(err);
        if (!perform) return cb({err : {code : -10002, message : 'can not find data'}});

        var update = _.extend(req_body, {modDate: Date.now()});
        var updated = _.merge(perform, update);

        cb(null, updated);
      });
    },
    function uploadFiles(perform, cb) {

      var updated;

      perform_id = perform._id;
      product_id = perform.product_id;

      path = Utils.getProductFilePath(req, 'perform', perform._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      var photo = perform.files || {};

      if (Object.keys(req.files).length > 0) {
        Object.keys(req.files).forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = req.files[val];

          var file_name = dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함

          file.dir = returnPath + '/';

          if(!photo[val]) photo[val] = {};
          photo[val].url = returnPath + '/' + file_name;
          photo[val].name = file_name;

          Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
            if (err) return cb(err);
          });

        });

        updated = _.merge(perform.files, photo);

        cb(null, updated);
      } else cb(null, perform);

    },function performUpdate(updated, cb) {
      updated.save(function (err) {
        if (err) cb(err);
        else cb(null, updated);
      });
    }

  ], function (err, updated) {
    if(err) return Utils.handleError(res, err);
    if(!perform_id) return res.status(401).send({err : {code : -10002, message : 'can not find perform_id'}});

    Product.findById(product_id, function (err, product) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: product});
    });

  });

};

