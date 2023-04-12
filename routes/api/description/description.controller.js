/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Desc = require('./description.model');
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var Project = require('../../../config/default.project');
var Utils = require('../../../config/utils');

/**
 * 설명글 가져오기
 * @param req
 * @param res
 */
exports.index = function(req, res) {
    var account_id = req.params.id;

    if(!account_id) return Utils.handleError(res, {err : {code : -10002, message : 'Unauthorized'}});

    Desc.find({uid : mongoose.Types.ObjectId(account_id)}).exec(function (err, desc) {
        if(err) Utils.handleError(res, err);
        else res.status(200).json({data : desc});
    });
};

/**
 * 설명글 저장
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
    var shortId = require('shortid');
    req.body.key = shortId.generate();
    req.body.uid = mongoose.Types.ObjectId(req.body.uid);

    Desc.create(req.body, function(err, desc) {
        if(err) Utils.handleError(res, err);
        else res.status(200).json({data : desc});
    });
};

/**
 * 설명글 삭
 * @param req
 * @param res
 */
exports.delete = function(req, res) {
    // var desc_id = mongoose.Types.ObjectId(req.params.id);
    Desc.findByIdAndRemove(req.params.id, function(err, result) {
        if(err) Utils.handleError(res, err);
        if(!result) Utils.handleError(res, {code : -10002, message : 'Unauthorized'});
        else res.status(200).json({data : result});
    });
};
