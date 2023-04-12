/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var MsgRoom = require('./../message/msgRoom.model.js');
var Message = require('./../message/message.model.js');
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var Project = require('../../../config/default.project');
var Log = require('log'), log = new Log('info');
var Utils = require('../../../config/utils');

var productLookup = {from: "products", localField: "productId", foreignField: "_id", as: "product"};
var messageLookup = {from: "messages", localField: "_id", foreignField: "roomId", as: "messages"};
var dealerLookup = {from: "users", localField: "dealer", foreignField: "_id", as: "dealerObj"};
var userLookup = {from: "users", localField: "user", foreignField: "_id", as: "userObj"};

/**
 * Get list of message
 */
exports.index = function (req, res) {
  var params = req.query.where;
  var match = {};

  var sort = {};

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {modDate: -1};

  if(params.members){
    _.extend(match,{
      members : {$in : [mongoose.Types.ObjectId(params.members)]}
    });
  }

  async.waterfall([
    function getMessageRoom(cb) {
      MsgRoom.aggregate(
        {$match: match}
        , {$sort: sort}
        , {$lookup: messageLookup}
        , {$lookup: productLookup}
        , {$unwind: "$product"}
        , {$lookup: dealerLookup}
        , {$unwind: "$dealerObj"}
        , {$lookup: userLookup}
        , {$unwind: "$userObj"}
        , {$project: Project.message.project}
        , {$group: Project.message.group}
      )
        .unwind("$userObj")
        .unwind("$dealerObj")
        .unwind("$phone_open")
        .exec(function (err, room) {
          if (err) return cb(err);
          else cb(null, room);
        });
    }, function getCount(rooms, cb) {
      MsgRoom.count(match).exec(function (err, count) {
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
 * get message room
 * @param req
 * @param res
 */
exports.room = function (req, res) {
  var message_id = req.params.id;

  var match = {
    _id : mongoose.Types.ObjectId(message_id)
  };

  MsgRoom.aggregate(
    {$match: match}
    , {$lookup: messageLookup}
    , {$lookup: productLookup}
    , {$unwind: "$product"}
    , {$lookup: dealerLookup}
    , {$unwind: "$dealerObj"}
    , {$lookup: userLookup}
    , {$unwind: "$userObj"}
    , {$project: Project.message.project}
    , {$group: Project.message.group}
  )
  .unwind("$userObj")
  .unwind("$dealerObj")
  .unwind("$phone_open")
  .exec(function (err, message) {
    if (err) return Utils.handleError(res, err);
    if (!message.length) return res.status(401).send({err : {code : -10002, message : 'can not find data'}});
    return res.status(200).json({data: message[0]});
  });

};
/**
 * Creates a new message
 */
exports.create = function (req, res, next) {

  var room_body = req.body;

  //상품과 판매자가 있다면 메시지만 생성 없다면 룸부터 생성
  async.waterfall([
    function findExist(cb) {

      var match = {
        productId: room_body.productId,
        user: room_body.user,
        type: room_body.type
      };

      MsgRoom.findOne(match).exec(function (err, result) {
        cb(null, result);
      });
    }, function getRoom(room, cb) {
      if (room) {
        return cb(null, room._id);
      }

      MsgRoom.create(room_body, function (err, newRoom) {
        if (err) {
          return cb(err)
        }
        cb(null, newRoom._id);
      });
    }
  ], function (err, room_id) {
    if (err) return Utils.handleError(res, err);

    var params = {
      roomId: room_id,
      uid: room_body.user,
      content: room_body.content
    };

    Message.create(params, function (err, message) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: message});
    });

  });

};

/**
 * 메시지 입력(기존 룸 존재)
 * @param req
 * @param res
 * @param next
 */
exports.message = function (req, res, next) {

  var body = req.body;

  var params = {
    roomId: body.room_id,
    uid: body.uid,
    content: body.content
  };

  Message.create(params, function (err, message) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: message});
  });

};
/**
 * message 읽음 상태 변경
 */
exports.read = function (req, res) {
  var params = req.body;

  Message.update(
    {roomId: params.room_id, _id : {$in : params.ids}}
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
  var params = req.body;

  async.waterfall([
    function leaveRoom(cb) {
      MsgRoom.update(
        {_id: params.room_id}
        ,{ $pull: { members: {$in: [req.body.uid]} }}
      ).exec(function (err, result) {
        if(err) return cb(err);
        else cb(null, result);
      });
    }, function checkEmpty(_continue, cb) {
      MsgRoom.findById(params.room_id, function (err, room) {
        if(err) return cb(err);

        if(!room.members.length){
          MsgRoom.remove({_id : params.room_id}).exec(function (err, result) {
            if (err) return cb(err);
            else cb(null, true);

          });
        } else {
          cb(null, false)
        }
      });
    }, function deleteMessages(_continue, cb) {
      if(!_continue){
        return cb(null, 'done');
      } else {
        Message.remove({roomId : params.room_id}).exec(function (err, result) {
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



