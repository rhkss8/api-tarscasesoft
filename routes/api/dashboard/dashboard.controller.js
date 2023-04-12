/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var MsgRoom = require('./../message/msgRoom.model');
var Question = require('./../question/question.model');
var Product = require('./../product/product.model');
var User = require('./../users/user.model');
var Review = require('./../review/review.model');
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var Project = require('../../../config/default.project');
var Log = require('log'), log = new Log('info');
var Utils = require('../../../config/utils');

exports.index = function (req, res) {

};
/**
 * 뱃지 가져오기 사용자
 * @param req
 * @param res
 */
exports.badge = function (req, res) {
  var body = req.query;

  async.parallel({
    //안읽음 메시지 뱃지
    message: function (cb) {
      var room_match = {members: {$in: [mongoose.Types.ObjectId(body.uid)]}};
      var message_match = {'messages.uid': {$ne: mongoose.Types.ObjectId(body.uid)}, 'messages.read': false};
      var messageLookup = {from: "messages", localField: "_id", foreignField: "roomId", as: "messages"};

      MsgRoom.aggregate(
        {$match: room_match}
        , {$lookup: messageLookup}
        , {"$unwind": "$messages"}
        , {$match: message_match}
        , {$project: Project.dashboard.message}
      )
        .exec(function (err, room) {
          if (err) return cb(err);
          else cb(null, room);
        });

    },
    video : function (cb) {

      var match = {
        'status.val' : '201',
        ids: { $elemMatch: { read: "unread", uid: { $in: [mongoose.Types.ObjectId(body.uid)] } } }
      };

      Question.find(match).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }

  },function (err,result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });
};

/**
 * 뱃지 가져오기 딜러
 * @param req
 * @param res
 */
exports.badgeDealer = function (req, res) {
  var body = req.query;

  async.parallel({
    //안읽음 메시지 뱃지
    message: function (cb) {
      var room_match = {members: {$in: [mongoose.Types.ObjectId(body.uid)]}};
      var message_match = {'messages.uid': {$ne: mongoose.Types.ObjectId(body.uid)}, 'messages.read': false};
      var messageLookup = {from: "messages", localField: "_id", foreignField: "roomId", as: "messages"};

      MsgRoom.aggregate(
        {$match: room_match}
        , {$lookup: messageLookup}
        , {"$unwind": "$messages"}
        , {$match: message_match}
        , {$project: Project.dashboard.message}
      )
        .exec(function (err, room) {
          if (err) return cb(err);
          else cb(null, room);
        });

    },
    video : function (cb) {

      var match = {
        'status.val' : '301',
        dealerId : mongoose.Types.ObjectId(body.uid),
        read : false
      };

      Question.find(match).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }

  },function (err,result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });
};


/**
 * 유저 차량 및 후기 정보
 * 전체차량,광고차,나의후기,광고수량 count
 */
exports.dealerActiveCount = function (req, res) {
  var userId = req.params.id;

  var product_q = {uid : mongoose.Types.ObjectId(userId)};

  async.parallel({
    product_all_count : function (cb) {

      Product.count(product_q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, count);
      });

    },
    add_count : function (cb) {

      _.extend(product_q,{'status.val' : '201'});

      Product.count(product_q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, count);
      });
    },
    add_all_count : function (cb) {

      User.findById(userId,'add', function (err, user) {
        if (err) return cb(err);
        else cb(null, (user && user.add && user.add.count)||0);
      });
    },
    reply_count : function (cb) {
      //TODO 후기 등록가능시 카운트 정리해서 추가
      Review.count({did : mongoose.Types.ObjectId(userId)}).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, count);
      });
    }
  },function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });

};
