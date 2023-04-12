/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Sell = require('./sell.model');
var _ = require('lodash');
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

  async.waterfall([
    function getItems(cb) {

      var projects = Project.sell;

      Sell.aggregate(
        {$match: match}
        , {$sort: sort}
        , {$skip: skip}
        , {$limit: limit}
        , {$project: projects}
      ).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });

    }, function getCount(rows, cb) {
      Sell.count(match).exec(function (err, count) {
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

  var projects = Project.sell;

  Sell.aggregate(
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

  // Sell.findById(req.params.id, function (err, result) {
  //   if (err) return Utils.handleError(res, err);
  //   if (!result) return Utils.handleError(res, {err_code: -1001});
  //   return res.status(200).json({data: result});
  // });
};

/**
 * sell 작성
 * @param req
 * @param res
 * @param next
 */
exports.createSell = function (req, res, next) {
  var path, newPath, returnPath;
  var req_params = Utils.isJson(req.body.data);

  //순서 : 상품 차량번호 검색후 판매완료로 변경 > 유저 찾아서 추가정보 업데이트 > 딜러 찾아서 평점 등록 > 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var param = _.extend(req_params, {})

      Sell.create(param, function (err, data) {
        if (err) return cb(err);
        else cb(null, data);
      });
    },
    function uploadFiles(inserted, cb) {

      path = Utils.getProductFilePath(req, 'sell', inserted._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      if (Object.keys(req.files).length > 0) {
        req.files.files.forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = val;
          var file_type = file.fieldName;
          if (!file_type) return;

          var file_name = file.name = 'sell' + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함
          if (file_type === 'extra_file') {

            file.dir = returnPath + '/';

            inserted[file_type].url = returnPath + '/' + file_name;
            inserted[file_type].name = file_name;

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          } else {

            file.dir = returnPath + '/';

            inserted.files.push({
              url : returnPath + '/' + file_name,
              name : file_name
            });

            Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
              if (err) return cb(err);
            });

          }

        });

        cb(null, inserted);
      } else cb(null, inserted);
    }

  ], function (err, updated) {

    if (err) return Utils.handleError(res, err);

    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: updated});
    });

  });

};
