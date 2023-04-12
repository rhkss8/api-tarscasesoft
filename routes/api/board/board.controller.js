/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Board = require('./board.model');
var _ = require('lodash');
var config = require('../../../config/environment');
var mongoose = require('mongoose');
var Q = require('q');
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

  async.waterfall([
    function getItems(cb) {

      var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "uWriter"};

      var projects = Project.board;

      Board.aggregate(
        {$match: match}
        , {$sort: sort}
        , {$skip: skip}
        , {$limit: limit}
        , {$lookup: writerLookup}
        , {$project: projects}
      ).unwind('uWriter').exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });

    }, function getCount(rows, cb) {
      Board.count(match).exec(function (err, count) {
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

  var replyUserLookup = {from: "users", localField: "reply.uid", foreignField: "_id", as: "reply.writer"};
  // var writerLookup = {from: "users", localField: "items.uid", foreignField: "_id", as: "items.writer"};

  var writerLookup = {from: "users", localField: "uid", foreignField: "_id", as: "uWriter"};

  var projects = Project.board;

  Board.aggregate(
    {$match: q}
    ,{ "$unwind": {path : "$reply" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
    , {$lookup: replyUserLookup}
    , {$lookup: writerLookup}
    ,{ "$unwind": "$uWriter" }
    ,{ "$unwind": {path : "$reply.writer" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
    ,{$project: _.extend(projects,{reply : {content : 1, writer : Project.user,regDate : 1, modDate : 1, _id : 1}})}
    ,{ "$group": {
      "_id": "$_id",
      "writer": { "$first": "$writer" },
      "title": { "$first": "$title" },
      "category": { "$first": "$category" },
      "sub_category": { "$first": "$sub_category" },
      "content": { "$first": "$content" },
      "answerable": { "$first": "$answerable" },
      "attachable": { "$first": "$attachable" },
      "eventExpireDate": { "$first": "$eventExpireDate" },
      "mainImage": { "$first": "$mainImage" },
      "files": { "$first": "$files" },
      "extra_file": { "$first": "$extra_file" },
      "views": { "$first": "$views" },
      "status": { "$first": "$status" },
      "regDate": { "$first": "$regDate" },
      "modDate": { "$first": "$modDate" },
      "uWriter": { "$first": "$uWriter" },
      "reply" : {"$push" : "$reply"}
    }}
  ).exec(function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: -1001});
    if(result.length){
      if(result[0].reply.length){
        if(Object.keys(result[0].reply[0]).length <= 0) result[0].reply = [];
      }
    }
    return res.status(200).json({data: result[0]});
  });

  // Board.findById(req.params.id, function (err, result) {
  //   if (err) return Utils.handleError(res, err);
  //   if (!result) return Utils.handleError(res, {code: -1001});
  //   return res.status(200).json({data: result});
  // });
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

  Board.create(board, function (err, board) {
    if (err) {
      return Utils.handleError(res, err);
    }
    return res.status(200).json({data : board});
  });
};

/**
 * 유저 문의글 목록 가져오기
 * @param req
 * @param res
 */
exports.getContactUser = function (req, res) {
  var q = Utils.isJson(req.query.where);
  var sort = {};
  var limit = parseInt(req.query.limit);
  var skip = parseInt(req.query.offset);

  _.extend(q,{"uid": mongoose.Types.ObjectId(req.params.id)});

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order;
  else
    sort = {regDate: 'desc'};

  // if (q.car_num)
  //   _.extend(q, {car_num: new RegExp(q.car_num, 'i')});

  async.waterfall([
    function getItems(cb) {
      Board.find(q).limit(limit).skip(skip).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }, function getCount(rows, cb) {
      Board.count(q).exec(function (err, count) {
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
 * 문의글 작성
 * @param req
 * @param res
 * @param next
 */
exports.contactUpload = function (req, res, next) {
  var path, newPath, returnPath;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var board = Utils.isJson(req.body.data);

      var uid = board.uid;
      var param = _.extend(board, {
        uid: mongoose.Types.ObjectId(uid) || {},
        status: {name: "board posted", val: 201}
      });

      Board.create(param, function (err, board) {
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
  Board.findById(req.params.id, function (err, board) {
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

  Board.findById(req.params.id, function (err, result) {
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

  Board.findById(req.params.id, function (err, product) {
    if (err) {
      return handleError(res, err);
    }
    if (!product) {
      return res.status(404).send('Not Found');
    }
    product.views++;
    product.save(function (err, result) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(result);
    });
  });
};


exports.contactReply = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  var temp = {reply : []};
  temp.reply.push(req.body);

  Board.findById(req.params.id, function (err, product) {
    if (err) { return handleError(res, err); }
    if(!product) { return res.status(404).send('Not Found'); }
    // product.reply.
    var updated;
    if(!req.body.index && req.body.index != 0){
      updated = _.concat(product.reply, temp.reply);
    } else {
      updated = _.remove(product.reply, function(n,t) {
        if(t != req.body.index) return n;
      });
    }
    product.reply = updated;
    product.save(function (err, result) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(result);
    });
  });
};
