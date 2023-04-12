/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Question = require('./question.model');
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var Project = require('../../../config/default.project');
var Log = require('log'), log = new Log('info');
var Utils = require('../../../config/utils');

var productLookup = {from: "products", localField: "productId", foreignField: "_id", as: "product"};
var dealerLookup = {from: "users", localField: "dealer", foreignField: "_id", as: "dealerObj"};
var userLookup = {from: "users", localField: "user", foreignField: "_id", as: "userObj"};

/**
 * Get list of message
 */
exports.index = function (req, res) {
  var params = req.query.where||{};
  var match = {};

  var sort = {};

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {modDate: -1};

  if(params.uid){
    _.extend(match,{
      'ids.uid' : {$in : [mongoose.Types.ObjectId(params.uid)]}
    });
  }

  if(params.dealer_id){
    _.extend(match,{
      dealerId : mongoose.Types.ObjectId(params.dealer_id)
    });
  }

  if(params.status){
    _.extend(match,{
      'status.val' : params.status
    });
  }

  async.waterfall([
    function getMessageRoom(cb) {
      Question.aggregate(
        {$match: match}
        , {$sort: sort}
        , {$lookup: productLookup}
        , {$unwind: "$product"}
        , {$project: Project.question.list}
      )
        .exec(function (err, room) {
          if (err) return cb(err);
          else cb(null, room);
        });
    }, function getCount(rooms, cb) {
      Question.count(match).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: rooms, count: count});
      });
    }
  ], function (err, message) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: message});
  });
};


/**
 * Creates a new message
 */
exports.create = function (req, res, next) {

  var body = req.body;

  //상품과 판매자가 있다면 메시지만 생성 없다면 룸부터 생성
  async.waterfall([
    function findExist(cb) {

      var match = {
        productId: body.productId,
        dealerId: body.dealerId
        // 'ids.uid' : {$in : [body.uid]}
      };

      Question.findOne(match).exec(function (err, result) {
        if(err) cb(err);
        else cb(null, result);
      });
    },function (question, cb) {
      if(!question){
        var params = {
          productId: body.productId,// 차량
          dealerId : body.dealerId,// 판매자
          ids : [{uid : body.uid}],// 요청자
          content : body.content,
          type : body.type
        };

        Question.create(params, function (err, message) {
          if (err) return Utils.handleError(res, err);
          return res.status(200).json({data: message});
        });
      } else {

        var is_uninstall_user = '000000010000010001000000' === body.uid;

        var exist;

        if(!is_uninstall_user){
          exist = (question.ids||[]).filter(function (row) {
            if(mongoose.Types.ObjectId(row.uid).equals(mongoose.Types.ObjectId(body.uid))) return row;
          });
        } else {
          exist = [];
        }

        if(exist.length){
          return cb(null, 'duplicate');
        } else {

          question.ids.push({uid : mongoose.Types.ObjectId(body.uid)});
          question.save(function (err) {
            if(err) cb(err);
            else cb(null, false);
          });
        }
      }

    }
  ], function (err, duplicate) {
    if (err) return Utils.handleError(res, err);
    if (duplicate) return res.status(401).send({err : {code : -3000, message : '이미 영상을 요청한 차량입니다.'}});

    return res.status(200).json({data: {}});
  });

};

/**
 * 영상요청 읽음 상태 변경 - user
 */
exports.read = function (req, res) {
  var body = req.body;

  async.waterfall([
    function (cb) {
      Question.update(
        {
          'status.val' : '201',
          ids: { $elemMatch: { read: "unread", uid: { $in: [mongoose.Types.ObjectId(body.uid)] } } }
        }
        ,{
          $push: { ids: { uid : mongoose.Types.ObjectId(body.uid), read : 'read'} }
        },{
          multi: true
        }).exec(function (err, result) {

          cb(err, result)
      });

    }
  ],function (err, result) {
    if (err) return Utils.handleError(res, err);
    Question.update(
      {
        'status.val' : '201',
        ids: { $elemMatch: { read: "unread", uid: { $in: [mongoose.Types.ObjectId(body.uid)] } } }
        // ids : {uid : {$in : [mongoose.Types.ObjectId(body.uid)]}, read : 'unread'}
      }
      ,{
        $pull: { ids: {uid: mongoose.Types.ObjectId(body.uid), read : 'unread'} }
      },{
        multi: true
      }).exec(function (err, result) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data : result});
    });

  });

};

/**
 * 영상요청 읽음 상태 변경 - dealer
 */
exports.readDealer = function (req, res) {
  var params = req.body;

  Question.update(
    {dealerId: params.dealerId}
    ,{
      $set: {
        read: true
      }
    },{
      multi: true
    }).exec(function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data : result});
  });

};

/**
 * 대화방 나가기
 * @param req
 * @param res
 */
exports.leave = function (req, res) {
  var body = req.body;

  async.waterfall([
    function leaveRoom(cb) {
      Question.update(
        {_id: body.question_id}
        // ,{ $pull: { ids: {$in: [{uid : mongoose.Types.ObjectId(req.body.uid)}]} }}
        ,{ $pull: { ids : {uid : mongoose.Types.ObjectId(req.body.uid)} }}
      ).exec(function (err, result) {
        if(err) return cb(err);
        else cb(null, result);
      });
    }, function checkEmpty(_continue, cb) {
      Question.findById(body.question_id, function (err, result) {
        if(err) return cb(err);

        if(!result.ids.length){
          cb(null, true);
        } else {
          cb(null, false);
        }
      });
    },
    function deleteMessages(_continue, cb) {
      if(!_continue){
        return cb(null, 'done');
      } else {
        Question.remove({_id : body.question_id}).exec(function (err, result) {
          if (err) return cb(err);
          else cb(null, 'done');
        });
      }
    }
  ],function (err, result) {
    if (err) return Utils.handleError(res, err);
    else return res.status(200).json(result);
  });

};

/**
 * 영상요청 삭제
 * @param req
 * @param res
 */
exports.delete = function (req, res) {
  Question.findByIdAndRemove(req.params.id, function(err, result) {
    if(err) { return Utils.handleError(res, err); }
    return res.status(200).json({data : result});
  });
};



