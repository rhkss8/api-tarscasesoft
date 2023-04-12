/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Blog = require('./blog.model');
var _ = require('lodash');
var config = require('../../../config/environment');
var mongoose = require('mongoose');
var Q = require('q');
var async = require('async');
var Project = require('../../../config/default.project');

function isJson(str) {
    try {
        str = JSON.parse(str);
    } catch (e) {
        str = str;
    }
    return str
}

/**
 * Get list of blog
 */
exports.index = function(req, res) {
    var return_obj = {};

    async.waterfall([
        function _getCount(cb) {
            if(req.query){
                var q = isJson(req.query.where);
                Blog.count(q).exec(function (err, count) {
                    if(err) return cb(err);
                    return_obj.total_count = count;
                    cb(null, count);
                });
            }else{
                Blog.count(function (err, count) {
                    if(err) return cb(err);
                    return_obj.total_count = count;
                    cb(null, count);
                });
            }
        },function _getBlog(count_obj, cb) {

            if(req.query){
                var q = isJson(req.query.where);
                var sort = isJson(req.query.sort);
                var limit = isJson(req.query.limit);
                var skip = isJson(req.query.skip);
                if(!sort.regDate) _.extend(sort,{regDate : -1});

                if(!!q.uid){
                    q.uid = mongoose.Types.ObjectId(q.uid);
                }

                var userLookup = {from: "users", localField: "uid", foreignField : "_id", as : "writer"};

                var projects = Project.blog;

                Blog.aggregate({$match : q} ,{$sort : sort}, {$skip : skip} , {$limit : limit},{$lookup : userLookup},{$project : projects}).unwind('writer').exec(function (err, products) {
                    if(err) return cb(err);
                    return_obj.items = products;
                    cb(null, products);
                })
            }else{
                Blog.find(function (err, products) {
                    if(err) return cb(err);
                    return_obj.items = products;
                    cb(null, products);
                });
            }
        }
    ],function (err, result) {
        if(err) return handleError(res, err);
        return res.status(200).json(return_obj);
    });
};

/**
 * 블로그 홈 정보 가져오기
 * 최근댓글, 전체 댓글, 등록된 글수 , 블로그 관심 표현 인원
 */
exports.home = function(req, res) {
    if(!req.params.id) return handleError({}, 'no user key');
    var return_obj = {};

    async.waterfall([
        function _getCount(cb) {
            var match = {
                uid : mongoose.Types.ObjectId(req.params.id)
            };
            //project 를 통해서 각 로우별 배열에 합을 구한다
            var projects = {
                views : 1
                ,reply_count: { $size: "$reply" }
                ,like_count: { $size: "$like" }
            };

            // 배열을 넘버로 만든것을 multiply로 합산을 한다
            var group = {
                _id : null
                ,views : { $sum: { $multiply: "$views" } }
                ,reply : { $sum: { $multiply: "$reply_count" } }
                ,like : { $sum: { $multiply: "$like_count" } }
                ,count : {$sum : 1}
            };

            Blog.aggregate(
                {$match : match}
                ,{$project : projects}
                ,{$group : group}
            ).exec(function (err, _res) {
                if(err) return cb(err);
                return_obj.count = _res[0];
                cb(null, _res[0]);
            });
        },function _getRecentReply(count_obj, cb) {

            var match = {
                uid : mongoose.Types.ObjectId(req.params.id)
                ,'reply.regDate' : {$gte : new Date()}
            };

            var projects = _.extend(Project.blog,{
                reply: {
                    $filter: {
                        "input": "$reply",
                        "as": "item",
                        "cond": {
                            "$and": [
                                { "$gte": [ "$$item.regDate", new Date() ] }
                            ]
                        }
                    }
                }
            });

            Blog.aggregate(
                {$match : match}
                ,{$project : projects}
            ).exec(function (err, _res) {
                if(err) return cb(err);
                return_obj.reply_arr = _res;
                cb(null, _res);
            });
        }
    ],function (err, result) {
        if(err) return handleError(res, err);
        return res.status(200).json(return_obj);
    });

};

/**
 * 블로그 디테일 정보 가져오기
 */
exports.homeDetail = function(req, res) {
    if(!req.params.id) return handleError({}, 'home detail :: no user key');
    if(!req.query) return handleError({}, 'home detail :: no params');

    var q = isJson(req.query.where) || {};
    var sort = isJson(req.query.sort) || {regDate : -1};
    var limit = isJson(req.query.limit) || 5;
    var skip = isJson(req.query.skip) || 0;

    _.extend(q,{uid : mongoose.Types.ObjectId(req.params.id)});

    var userLookup = {from: "users", localField: "uid", foreignField : "_id", as : "writer"};

    var projects = Project.blog;

    if(req.query.type === 'like') _.extend(projects,{like_count: { $size: "$like" }});

    Blog.aggregate(
        {$match : q}
        ,{$skip : skip}
        ,{$limit : limit}
        ,{$lookup : userLookup}
        ,{$project : projects}
        ,{$sort : sort}
        ).unwind('writer').exec(function (err, products) {
        if(err) { return handleError(res, err); }

        return res.status(200).json(products);
    })


};

/**
 * Get list count of sale
 */
exports.count = function(req, res) {
    if(req.query){
        var q = isJson(req.query.where);
        Blog.count(q).exec(function (err, count) {
            if(err) { return handleError(res, err); }
            return res.status(200).json([{count:count}]);
        });
    }else{
        Blog.count(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }
};
/**
 * Get list count of sale
 */
exports.userBlog = function(req, res) {

    var promises = [getPre(), getNext()];

    Q.all(promises).then(function (response) {
        var result = _.concat(response[0],response[1]);
        return res.status(200).json(result);
    },function (err) {
        return handleError(res, err);
    });

    function getPre() {
        var deferred = Q.defer();
        var pre = {
            regDate : {$lte : req.query.regDate},
            uid : req.query.uid
        };

        Blog.find(pre).limit(3).sort({regDate : -1}).exec(function (err, items) {
            if(err) deferred.reject(err);
            else  deferred.resolve(items);
        });
        return deferred.promise;
    }

    function getNext() {
        var deferred = Q.defer();
        var next = {
            regDate : {$gt : req.query.regDate},
            uid : req.query.uid
        }

        Blog.find(next).limit(2).exec(function (err, items) {
            if(err) deferred.reject(err);
            else  deferred.resolve(items);
        });
        return deferred.promise;
    }




};

/**
 * Creates a new blog
 */
exports.create = function (req, res, next) {
    // req.body.uid = req.body._id; // id change on every login hence email is used
    var shortId = require('shortid');
    req.body.blogNo = shortId.generate();
    req.body.uid = mongoose.Types.ObjectId(req.body.uid)
    req.body.status = {name:"blog posted", val:201};
    Blog.create(req.body, function(err, blog) {
        if(err) { return handleError(res, err); }
        return res.status(200).json(blog);
        });
};
/**
 * view-update blog
 */
// Updates an existing sale in the DB.
exports.viewUpdate = function(req, res) {
    if(req.body._id) { delete req.body._id; }
    req.body.modDate = Date.now();

    Blog.findById(req.params.id, function (err, product) {
        if (err) { return handleError(res, err); }
        if(!product) { return res.status(404).send('Not Found'); }
        product.views ++;
        product.save(function (err,result) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(result);
        });
    });
};
/**
 * Get single of sale
 */
exports.show = function(req, res) {


    var userId = req.params.id;

    var userLookup = {from: "users", localField: "uid", foreignField : "_id", as : "writer"};

    var projects = Project.blog;

    Blog.aggregate({$match : {"_id" : mongoose.Types.ObjectId(userId)}},{$lookup : userLookup},{$project : projects}).unwind('writer').exec(function (err, products) {
        if(err) { return handleError(res, err); }

        return res.status(200).json(products[0]);
    })
};

/**
 * update sale
 */
// Updates an existing sale in the DB.
exports.update = function(req, res) {
    if(req.body._id) { delete req.body._id; }
    req.body.modDate = Date.now();
    Blog.findById(req.params.id, function (err, product) {
        if (err) { return handleError(res, err); }
        if(!product) { return res.status(404).send('Not Found'); }
        var updated = _.merge(product, req.body);
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(product);
        });
    });
};

/**
 * update reply
 */
// Updates an existing sale in the DB.
exports.reply = function(req, res) {
    if(req.body._id) { delete req.body._id; }
    var temp = {reply : []};
    temp.reply.push(req.body);

    Blog.findById(req.params.id, function (err, product) {
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

function handleError(res, err) {
    console.log(err);
    //
    // var path = "/tmp/error.log";
    // var fs = require('fs');
    // s = err.toString().replace(/\r\n|\r/g, '\n'); // hack
    // var fd = fs.openSync(path, 'a+', '0666');
    // fs.writeSync(fd, s + '\n');
    // fs.closeSync(fd);

    return res.status(500).send(err);
}




