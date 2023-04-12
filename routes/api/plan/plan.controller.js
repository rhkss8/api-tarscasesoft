'use strict';

var Plan = require('./../plan/plan.model');
var Product = require('./../product/product.model');
var Utils = require('../../../config/utils');
var Project = require('../../../config/default.project');
var _ = require('lodash');
var config = require('../../../config/environment/index');
var mongoose = require('mongoose');
var async = require('async');
var shortId = require('shortid');
var dateFormat = require('dateformat'),
  date = new Date();

/**
 * Get list of Plan
 */
exports.index = function(req, res) {

  var q = Utils.isJson(req.query.where);

  async.waterfall([
    function getItems(cb) {

      var sort = {};

      if (req.query.sort_name && req.query.sort_order)
        sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
      else
        sort = {regDate: -1};

      Plan.find(q).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }, function getCount(items, cb) {
      Plan.count(q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: items, count: count});
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

// 기회전 + 등록차량 api
// exports.dashboard = function (req, res) {
//
//   var q = Utils.isJson(req.query.where);
//
//   var sort = {};
//
//   if(q.status){
//     _.extend(q,{status : parseInt(q.status)});
//   }
//
//
//   if (req.query.sort_name && req.query.sort_order)
//     sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
//   else
//     sort = {regDate: -1};
//
//   var productLookup = {from: "products", localField: "items.product_id", foreignField: "_id", as: "items"};
//   var writerLookup = {from: "users", localField: "items.uid", foreignField: "_id", as: "items.writer"};
//
//   var projects = Project.product;
//
//   Plan.aggregate(
//     {$match: q}
//     , {$sort: sort}
//     ,{ "$unwind": {path : "$items" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
//     ,{$lookup: productLookup}
//     ,{ "$unwind": {path : "$items" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
//     ,{$lookup: writerLookup}
//     ,{ "$unwind": {path : "$items.writer" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
//     ,{$project: {
//         items : projects,
//         type : 1,
//         title : 1,
//         sub_title : 1,
//         photo : 1,
//         status : 1,
//         regDate : 1,
//         modDate : 1
//       }
//     }
//     ,{ "$group": {
//       "_id": "$_id",
//       "type": { "$first": "$type" },
//       "title": { "$first": "$title" },
//       "sub_title": { "$first": "$sub_title" },
//       "photo": { "$first": "$photo" },
//       "status": { "$first": "$status" },
//       "regDate": { "$first": "$regDate" },
//       "modDate": { "$first": "$modDate" },
//       "items": { "$push": "$items" }
//     }}
//   ).exec(function (err, result) {
//     if (err) return Utils.handleError(res, err);
//     if (!result) return Utils.handleError(res, {code: -1001});
//     return res.status(200).json({data: result});
//   });
// };
exports.helloDashboard = function (req, res) {

  var q = Utils.isJson(req.query.where);

  var sort = {};

  if(q.status){
    _.extend(q,{status : parseInt(q.status)});
  }

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {regDate: -1};

  var param = {
    'status.val': '201'
  }

  Product.aggregate(
    {$match: param}
    ,{$sample: { size: 20 }}
  ).exec(function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });
}

exports.dashboard = function (req, res) {

  var q = Utils.isJson(req.query.where);

  var sort = {};

  if(q.status){
    _.extend(q,{status : parseInt(q.status)});
  }


  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {regDate: -1};

  async.parallel({
    //안읽음 메시지 뱃지
    promotion: function (cb) {
      Plan.find(q).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    },
    tiny: function (cb) {
      var param = {
        'status.val': '201',
        model_type: '경차'
      }
      Product.aggregate(
        {$match: param}
        ,{$sample: { size: 10 }}
      ).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    },
    medium: function (cb) {
      var param = {
        'status.val': '201',
        model_type: '준중형'
      }
      Product.aggregate(
        {$match: param}
        ,{$sample: { size: 10 }}
      ).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    },
    suv: function (cb) {
      var param = {
        'status.val': '201',
        model_type: 'SUV,RV'
      }
      Product.aggregate(
        {$match: param}
        ,{$sample: { size: 10 }}
      ).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    },
    recent: function (cb) {
      var param = {
        'status.val': '201',
      }
      Product.aggregate(
        {$match: param}
        ,{$sample: { size: 10 }}
      ).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });

    }

  },function (err,result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });
}

/**
 * 기획전 가져오기
 * @param req
 * @param res
 */
exports.one = function (req, res) {

  Plan.findOne({_id : mongoose.Types.ObjectId(req.params.id)}, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: -1001});
    return res.status(200).json({data: result});
  });
};

exports.product = function (req, res) {

  var q = {_id : mongoose.Types.ObjectId(req.params.id)};

  var productLookup = {from: "products", localField: "items.product_id", foreignField: "_id", as: "items"};
  var writerLookup = {from: "users", localField: "items.uid", foreignField: "_id", as: "items.writer"};

  var projects = Project.product;

  Plan.aggregate(
    {$match: q}
    ,{ "$unwind": {path : "$items" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
    ,{$lookup: productLookup}
    ,{ "$unwind": {path : "$items" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
    ,{$lookup: writerLookup}
    ,{ "$unwind": {path : "$items.writer" , includeArrayIndex : 'a', preserveNullAndEmptyArrays : true}}
    ,{$project: {
      items : projects,
      type : 1,
      title : 1,
      sub_title : 1,
      photo : 1,
      status : 1,
      regDate : 1,
      modDate : 1
    }
    }
    ,{ "$group": {
      "_id": "$_id",
      "type": { "$first": "$type" },
      "title": { "$first": "$title" },
      "sub_title": { "$first": "$sub_title" },
      "photo": { "$first": "$photo" },
      "status": { "$first": "$status" },
      "regDate": { "$first": "$regDate" },
      "modDate": { "$first": "$modDate" },
      "items": { "$push": "$items" }
    }}
  ).exec(function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: -1001});
    return res.status(200).json({data: result});
  });
};

/**
 * Creates a new Plan
 */
exports.create = function (req, res, next) {
  var path, newPath, returnPath;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var req_body = Utils.isJson(req.body.data);

      Plan.create(req_body, function (err, plan) {
        if (err) return cb(err);
        else {
          cb(null, plan);
        }
      });

    },
    function count(plan, cb) {
      if(plan.type === 'promotion'){
        Plan.count({type : 'promotion'}).exec(function (err, count) {
          if (err) return cb(err);

          _.extend(plan,{order : count === 0 ? count : count-1});
          cb(null, plan);
        });
      } else cb(null, plan);

    },
    function uploadFiles(plan, cb) {

      var updated;
      path = Utils.getProductFilePath(req, 'plan', plan._id);
      newPath =  path.newPath;
      returnPath = path.returnPath;

      var photo = plan.photo||{};

      if(Object.keys(req.files).length > 0){
        Object.keys(req.files).forEach(function (val) {
          var newName = shortId.generate();

          var file = req.files[val];
          var names = file.fieldName;
          if(!names) return;

          var file_name = file.name = file.fieldName + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
          file.dir = returnPath + '/';

          if(names === 'orgfile'){
            photo.url = returnPath + '/' + file_name;
            photo.name = file_name;
          } else {
            photo.thumb_url = returnPath + '/' + file_name;
          }

          Utils.fileRename(file.path, newPath + '/' + file_name,function (err) {
            if(err) return cb(err);
          });
        });


        updated =  _.merge(plan.photo, photo);

        cb(null, updated);
      } else cb(null, plan);
    },
    function (updated, cb) {
      updated.save(function (err) {
        if (err) cb(err);
        else cb(null, updated);
      });
    }

  ],function (err, updated) {
    if(err) return Utils.handleError(res, err);

    Plan.findById(req.params.id, function (err, product) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data : product});
    });

  });

};

exports.order = function(req, res) {

  var req_body = Utils.isJson(req.body);

  async.waterfall([
    function (cb) {
      var _done = [];
      (req_body||[]).forEach(function (row, index) {
        Plan.update(
          {_id: {$in: req_body[index]._id}}
          ,{
            $set: {
              order: req_body[index].order
            }
          },{
            multi: true
          }).exec(function (err, result) {
            if(err) return cb(err);
            else _done.push(result);
        });
      });

      cb(null, _done);
    }
  ],function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data : result});
  })

};

/**
 * Update Plan
 */
exports.update = function(req, res) {

  var path, newPath, returnPath;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var req_body = Utils.isJson(req.body.data);

      Plan.findById(req.params.id, function (err, product) {
        if (err) return cb(err);
        if (!product) return cb({code: 1001});

        var update = _.extend(req_body, {modDate: Date.now()});
        var updated = _.merge(product, update);
        cb(null, updated);
      });

    },
    function uploadFiles(plan, cb) {

      var updated;
      path = Utils.getProductFilePath(req, 'plan', plan._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      var photo = plan.photo || {};

      if (Object.keys(req.files).length > 0) {
        Object.keys(req.files).forEach(function (val) {
          var newName = shortId.generate();

          var file = req.files[val];
          var names = file.fieldName;
          if (!names) return;

          var file_name = file.name = file.fieldName + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
          file.dir = returnPath + '/';

          if (names === 'orgfile') {
            photo.url = returnPath + '/' + file_name;
            photo.name = file_name;
          } else {
            photo.thumb_url = returnPath + '/' + file_name;
          }

          Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
            if (err) return cb(err);
          });
        });


        updated = _.merge(plan.photo, photo);

        cb(null, updated);
      } else cb(null, plan);
    },
    function (updated, cb) {
      updated.save(function (err) {
        if (err) cb(err);
        else cb(null, updated);
      });
    }

  ], function (err, updated) {
    if (err) return Utils.handleError(res, err);

    Plan.findById(req.params.id, function (err, product) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: product});
    });

  });
};

/**
 * delete Plan by id
 */
exports.delete = function(req, res) {
    Plan.findByIdAndRemove(req.params.id, function(err, result) {
        if(err) { return Utils.handleError(res, err); }
        return res.status(200).json(result);
    });
};

/**
 * 상태변경
 * @param req
 * @param res
 * @param next
 * 추천매물은 하나만 등록가능하기때문에 하나이상등록시  return 해준다
 */
exports.status = function (req, res, next) {

  async.waterfall([
    function checkRecommend(cb) {
      if(req.body.type !== 'recommend') cb();

      Plan.find({type : req.body.type}).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });


    }
  ],function (err, result) {
    if (err) return Utils.handleError(res, err);
    if(result){
      var filter_arr = result.filter(function (row) {
        return row.status === 201;
      });

      if(filter_arr.length > 0 && req.body.status === 201) return res.status(401).send({err : {code : -3000, message : 'no more recommend'}});
    }

    var update = {
      status : req.body.status,
      modDate : Date.now()
    };

    Plan.findById(req.params.id, function (err, result) {
      if (err) return Utils.handleError(res, err);
      if (!result) return res.status(401).send({err : {code : -10002, message : 'can not find data'}});

      var updated = _.merge(result, update);

      updated.save(function (err) {
        if (err) return Utils.handleError(res, err);
        return res.status(200).json({data: updated});
      });
    });

  });
};

exports.updateProducts = function(req, res) {

  var req_body = Utils.isJson(req.body);

  Plan.findById(req.params.id, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return res.status(401).send({err : {code : -10002, message : 'can not find data'}});

    var update = _.extend(req_body, {modDate: Date.now()});
    var updated = _.extend(result, update);

    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: updated});
    });

  });

};

