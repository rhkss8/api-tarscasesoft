/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Event = require('./event.model');
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
 * 이벤트 댓글 목록 가져오기
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

      var projects = Project.event;

      Event.aggregate(
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
      Event.count(match).exec(function (err, count) {
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

  var q = {uid : mongoose.Types.ObjectId(req.params.uid)};

  var boardLookup = {from: "boards", localField: "board_id", foreignField: "_id", as: "board"};
  // var writerLookup = {from: "users", localField: "items.uid", foreignField: "_id", as: "items.writer"};

  var userLookup = {from: "users", localField: "uid", foreignField: "_id", as: "user"};

  var projects = Project.event;

  Event.aggregate(
    {$match: q}
    ,{$lookup: boardLookup}
    ,{$lookup: userLookup}
    ,{$sort : {regDate: -1}}
    ,{ "$unwind": "$board" }
    ,{ "$unwind": "$user" }
    ,{$project: _.extend(projects,{
      user : {_id : 1, name : 1, email : 1, modDate : 1, photo : 1},
      board : {_id :1, mainImage : 1, title : 1,category : 1, modDate : 1, regDate : 1, status : 1, eventExpireDate :1}
    })}
  ).exec(function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: -1001});
    return res.status(200).json({data: result});
  });

  // Event.findById(req.params.id, function (err, result) {
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
      Event.find(q).limit(limit).skip(skip).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }, function getCount(rows, cb) {
      Event.count(q).exec(function (err, count) {
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
 * 이벤트 참여글 작성
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
  var path, newPath, returnPath;

  //순서 : 이벤트 참여글 먼저 등록 > 파일업로드 > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var event = Utils.isJson(req.body.data);

      if (event){
        var param = _.extend(event, {
          uid: mongoose.Types.ObjectId(event.uid),
          board_id : mongoose.Types.ObjectId(event.board_id)
        });
      }

      Event.create(param, function (err, event) {
        if (err) return cb(err);
        else cb(null, event);
      });
    },
    function uploadFiles(event, cb) {

      path = Utils.getProductFilePath(req, 'event', event._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      if (Object.keys(req.files).length > 0) {
        req.files.files.forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = val;
          var file_type = file.fieldName;
          if (!file_type) return;

          var file_name = file.name = 'event' + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
          file.dir = returnPath + '/';

          event.files.push({
            url : returnPath + '/' + file_name,
            name : file_name
          });

          Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
            if (err) return cb(err);
          });

        });

        cb(null, event);
      } else cb(null, event);
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
  Event.findById(req.params.id, function (err, event) {
    if (err) return Utils.handleError(res, err);
    if (!event) return res.status(401).send({err : {code : -10002, message : 'can not find data'}});

    var updated = _.merge(event, req.body);
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

  Event.findById(req.params.id, function (err, result) {
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

  Event.findById(req.params.id, function (err, product) {
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

  Event.findById(req.params.id, function (err, product) {
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


exports.delete = function(req, res) {
  Event.findByIdAndRemove(req.params.id, function(err, result) {
    if(err) { return Utils.handleError(res, err); }
    return res.status(200).json(result);
  });
};
