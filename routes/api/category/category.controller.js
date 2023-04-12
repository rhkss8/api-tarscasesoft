'use strict';

var Category = require('./../category/category.model');
var Utils = require('../../../config/utils');
var Project = require('../../../config/default.project');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

/**
 * Get list of Category
 */
exports.index = function(req, res) {

    var q = Utils.isJson(req.query.where);


    if(q.parent_uid){
      _.extend(q,{parent_uid : mongoose.Types.ObjectId(q.parent_uid)});
    }

    Category.find(q).exec(function (err, result) {
        if(err) { return Utils.handleError(res, err); }
        return res.status(200).json({data : result});
    });
};

/**
 * 카테고리 다중 가져오기
 * @param req
 * @param res
 */
exports.multi = function(req, res) {

  var match = Utils.isJson(req.query.where);
  var group = Project.multi_cate_group;

  var parentLookup = {from: "categories", localField: "parent_uid", foreignField: "_id", as: "parent"};

  var projects = Project.category;

  var pipeline = [
    {$match: match}
    , {$lookup: parentLookup}
    , {$project: projects}
  ];

  if(match.parent_uid) {
    var ids = [];
    match.parent_uid['$in'].forEach(function (val) {
      ids.push(mongoose.Types.ObjectId(val));
    });

    _.extend(match.parent_uid,{
      '$in' : ids
    });

    pipeline.push({ $unwind : "$parent" });
    pipeline.push({ $group : group });
  }

  callQuery();

  function callQuery() {
    Category.aggregate(
      pipeline
    ).exec(function (err, data) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: data});
    });
  }
};
/**
 * Creates a new Category
 */
exports.create = function (req, res, next) {

    Category.create(req.body, function(err, result) {
        if(err) { return Utils.handleError(res, err); }
        return res.status(200).json({data:result});
    });

};

/**
 * Update Category
 */
exports.update = function(req, res) {

    var update = _.extend(req.body,{modDate : Date.now()});

    Category.findById(req.params.id, function (err, result) {
        if(err) return Utils.handleError(res, err);
        if(!result) return Utils.handleError(res, {code : 1001});
        var updated = _.merge(result, update);
        updated.save(function (err) {
            if(err) { return Utils.handleError(res, err); }
            return res.status(200).json({data:updated});
        });
    });


    // Category.update({_id : req.params.id}, update,function (err, result) {
    //     if(err) { return Utils.handleError(res, err); }
    //     return res.status(200).json({data:update});
    // })
};

/**
 * delete Category by id
 */
exports.delete = function(req, res) {
    Category.findByIdAndRemove(req.params.id, function(err, result) {
        if(err) { return Utils.handleError(res, err); }
        return res.status(200).json(result);
    });
};


exports.getModelType = function (req, res) {
  var match = req.query.where||{};

  if(match.status) {
    _.extend(match,{
      'status' : parseInt(match.status)
    });
  }

  if(match.parent_uid) {
    var ids = [];
    match.parent_uid['$in'].forEach(function (val) {
      ids.push(mongoose.Types.ObjectId(val));
    });

    _.extend(match.parent_uid,{
      '$in' : ids
    });
  }

  var sort = {};

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {name: -1};

  async.waterfall([
    function getCategory(cb) {
      Category.aggregate(
        {$match: match}
        , {$sort: sort}
        , {$group: {_id : "$model_type", items: { $push: "$$ROOT" }}}
      )
        .exec(function (err, room) {
          if (err) return cb(err);
          else cb(null, room);
        });
    }, function getCount(rooms, cb) {
      Category.count(match).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: rooms, count: count});
      });
    }
  ], function (err, category) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: category});
  });
};

exports.multiDetail = function(req, res) {

  var match = Utils.isJson(req.query.where);

  var parentLookup = {from: "categories", localField: "parent_uid", foreignField: "_id", as: "parent"};

  var projects = Project.category;

  async.waterfall([
    function getParent(cb) {
      var pipeline = [
        {$match: match}
        , {$lookup: parentLookup}
        , {$project: projects}
      ];
      var group = Project.multi_detail_parent_cate_group;

      if(match.parent_uid) {
        var ids = [];
        match.parent_uid['$in'].forEach(function (val) {
          ids.push(mongoose.Types.ObjectId(val));
        });

        _.extend(match.parent_uid,{
          '$in' : ids
        });

        pipeline.push({ $unwind : "$parent" });
        pipeline.push({ $group : group });
      }

      Category.aggregate(
        pipeline
      ).exec(function (err, data) {
        if (err){
          cb(err);
        } else {
          cb(null, data);
        }
      });
    }, function getChildIds(category, cb) {
      if(!category || category.length <= 0) {
        cb({code : -10004, message : 'can not find data'})
      } else {
        var ids = [];
        category[0].items.forEach(function (val) {
          ids.push(mongoose.Types.ObjectId(val._id));
        });

        cb(null, ids)
      }
    }
  ], function (err, ids) {
    if (err) return Utils.handleError(res, err);

    var pipeline = [
      {$match: match}
      , {$lookup: parentLookup}
      , {$project: projects}
    ];

    var group = Project.multi_detail_cate_group;

    if(ids.length > 0) {
      _.extend(match.parent_uid,{
        '$in' : ids
      });

      pipeline.push({ $unwind : "$parent" });
      pipeline.push({ $group : group });

      Category.aggregate(
        pipeline
      ).exec(function (err, data) {
        if (err) return Utils.handleError(res, err);
        return res.status(200).json({data: data});
      });
    } else {
      return res.status(401).send({code : -10004, message : 'can not find data'});
    }
  });
};
