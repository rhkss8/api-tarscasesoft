/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Review = require('./review.model');
var Product = require('../product/product.model');
var User = require('../users/user.model');
var _ = require('lodash');
var config = require('../../../config/environment');
var mongoose = require('mongoose');
var async = require('async');
var Project = require('../../../config/default.project');
var Utils = require('../../../config/utils');
var
  dateFormat = require('dateformat'),
  date = new Date();


/**
 * 게시글 목록 가져오기
 * @param req
 * @param res
 */
exports.index = function (req, res) {
  var match = Utils.isJson(req.query.where);
  var sort = {};
  var limit = parseInt(req.query.limit);
  var skip = parseInt(req.query.offset);

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {regDate: -1};

  if(match.did){
    _.extend(match,{did : mongoose.Types.ObjectId(match.did)});
  }

  async.waterfall([
    function getItems(cb) {

      var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "writer"};
      var dealerLookup = {from: "users", localField: "did", foreignField: "_id", as: "dealer"};

      var projects = Project.review;

      Review.aggregate(
        {$match: match}
        , {$sort: sort}
        , {$skip: skip}
        , {$limit: limit}
        , {$lookup: writerLookup}
        , {$lookup: dealerLookup}
        , {$project: projects}
      ).unwind('writer').unwind('dealer').exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });

    }, function getCount(rows, cb) {
      Review.count(match).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: rows, count: count});
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

/**
 * 게시글 가져오기 - by id
 * @param req
 * @param res
 */
exports.one = function (req, res) {

  var q = {_id : mongoose.Types.ObjectId(req.params.id)};

  var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "writer"};
  var dealerLookup = {from: "users", localField: "did", foreignField: "_id", as: "dealer"};

  var projects = Project.review;

  Review.aggregate(
    {$match: q}
    , {$lookup: writerLookup}
    , {$lookup: dealerLookup}
    ,{ "$unwind": "$writer"}
    ,{ "$unwind": "$dealer"}
    ,{$project: projects}

  ).exec(function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: -1001});
    return res.status(200).json({data: result[0]});
  });

  // Review.findById(req.params.id, function (err, result) {
  //   if (err) return Utils.handleError(res, err);
  //   if (!result) return Utils.handleError(res, {err_code: -1001});
  //   return res.status(200).json({data: result});
  // });
};

exports.count = function(req, res) {
  if(req.params.id){

    var match = {
      did : mongoose.Types.ObjectId(req.params.id),
      "status.val" : "201"
    };
    Review.count(match).exec(function (err, result) {
      if(err) { return handleError(res, err); }
      return res.status(200).json({data: result});
    });
  }else{
    Review.count(function (err, result) {
      if(err) { return handleError(res, err); }
      return res.status(200).json({data: result});
    });
  }
};

/**
 * 게시글 이미지업로드
 * @param req
 * @param res
 * @param next
 */
exports.imageUpload = function (req, res, next) {
  var path, newPath, returnPath;
  var shortId = require('shortid');
  var file_id = shortId.generate();

  path = Utils.getProductFilePath(req, 'product', dateFormat(date, "yyyymmddhMMss_")+file_id);
  newPath = path.newPath;
  returnPath = path.returnPath;

  if (Object.keys(req.files).length > 0) {
    Object.keys(req.files).forEach(function (val) {
      var newName = shortId.generate();

      var file = req.files[val];
      var file_type = file.fieldName;
      if (!file_type) return;

      var file_name = file.name = file.fieldName + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
      file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
      file.dir = returnPath + '/';

      var this_board_url = returnPath + '/' + file_name;

      Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
        if (err) return Utils.handleError(res, err);
        return res.status(200).json({data: {url : this_board_url}});
      });

    });


  } else
    return Utils.handleError(res, {code : -1000, message : 'NO_FILE_DATA'});

};

/**
 * 게시글 작성
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
  var board = Utils.isJson(req.body);
  if (board)
    _.extend(board, {uid: mongoose.Types.ObjectId(board.uid)});

  Review.create(board, function (err, board) {
    if (err) {
      return Utils.handleError(res, err);
    }
    return res.status(200).json({data : board});
  });
};

/**
 * review 작성
 * @param req
 * @param res
 * @param next
 */
exports.createReview = function (req, res, next) {
  var path, newPath, returnPath;
  var req_params = Utils.isJson(req.body.data);

  //순서 : 상품 차량번호 검색후 판매완료로 변경 > 유저 찾아서 추가정보 업데이트 > 딜러 찾아서 평점 등록 > 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function findProduct(cb) {

      var param = {
        car_num : req_params.car_num
      };

      Product.findOne(param, function (err, product) {
        if (err) return cb(err);
        if (!product) return cb(null, {});

        var updated = _.merge(product, {status : {name : 'product sold by review', val : '701'}});
        updated.save(function (err) {
          if (err) return cb(err);
          cb(null, product);
        });

      });

    },
    function findUser(product, cb) {

      User.findById(req_params.uid, function (err, user) {
        if (err) return cb(err);

        var updated = _.merge(user, {
          age : req_params.user.age,
          city : req_params.user.city,
          gender : req_params.user.gender
        });
        updated.save(function (err) {
          if (err) return cb(err);
          cb(null, user);
        });

      });

    },
    function findDealer(product, cb) {

      User.findById(req_params.did, function (err, user) {
        if (err) return cb(err);

        var updated = _.merge(user.review, {
          grade : req_params.grade + user.review.grade,
          count : user.review.count ? user.review.count+1 : 1
        });
        updated.save(function (err) {
          if (err) return cb(err);
          cb(null, user);
        });

      });

    },
    function insert(user, cb) {
      var uid = req_params.uid;
      var param = _.extend(req_params, {
        uid: mongoose.Types.ObjectId(uid) || {},
        status: {name: "review posted", val: 301}//리뷰는 이미지를 모자이크 처리해서 올려야함
      });

      Review.create(param, function (err, board) {
        if (err) return cb(err);
        else cb(null, board);
      });
    },
    function uploadFiles(board, cb) {

      path = Utils.getProductFilePath(req, 'board', board._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      if (Object.keys(req.files).length > 0) {
        req.files.files.forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = val;
          var file_type = file.fieldName;
          if (!file_type) return;

          var file_name = file.name = 'contact' + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
          if (file_type === 'extra_file') {

            file.dir = returnPath + '/';

            board[file_type].url = returnPath + '/' + file_name;
            board[file_type].name = file_name;

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          } else {

            file.dir = returnPath + '/';

            board.files.push({
              url : returnPath + '/' + file_name,
              name : file_name
            });

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          }

        });

        cb(null, board);
      } else cb(null, board);
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
 * 게시글 수정
 * @param req
 * @param res
 */
exports.update = function(req, res) {
  // if(req.body._id) { delete req.body._id; }
  req.body.modDate = Date.now();
  Review.findById(req.params.id, function (err, board) {
    if (err) return Utils.handleError(res, err);
    if (!board) return res.status(401).send({err : {code : -10002, message : 'can not find data'}});

    var updated = _.merge(board, req.body);
    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data : updated});
    });
  });
};

exports.status = function (req, res, next) {

  var update = _.extend(req.body, {
    modDate: Date.now()
  });

  Review.findById(req.params.id, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return res.status(401).send({err : {code : -10002, message : 'can not find data'}});

    var updated = _.merge(result, update);

    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: updated});
    });
  });
};

exports.viewUpdate = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  req.body.modDate = Date.now();

  Review.findById(req.params.id, function (err, review) {
    if (err) {
      return handleError(res, err);
    }

    if (!review) return res.status(401).send({err : {code : -10002, message : 'can not find data'}});

    review.views = review.views + 1;
    review.save(function (err, result) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json({data: result});
    });
  });
};
