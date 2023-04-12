/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var Request = require('./../request/request.model');
var _ = require('lodash');
var config = require('../../../config/environment/index');
var mongoose = require('mongoose');
var Q = require('q');

/**
 * Get list of blog
 */
exports.index = function(req, res) {

    if(req.query){
        var q = isJson(req.query.where);
        var sort = isJson(req.query.sort);
        var select = isJson(req.query.select);

        Request.find(q).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(sort).exec(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }else{
        Request.find(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }
};

/**
 * Get single of Message
 */
exports.view = function(req, res) {

    var messageId = req.params.id;

    var match = {
        _id : mongoose.Types.ObjectId(messageId)
    }

    var sendUserLookup = {from: "users", localField: "sendUid", foreignField : "_id", as : "sendUserObj"};
    var getUserLookup = {from: "users", localField: "getUid", foreignField : "_id", as : "getUserObj"};

    var projects = {
        regDate : 1
        ,views : 1
        ,phoneStatus : 1
        ,content : 1
        ,status : 1
        ,sendStatus : 1
        ,sendUserObj : { name : 1 , email : 1 , profile : 1 , _id : 1 , phone : 1}
        ,getUserObj : { name : 1 , email : 1 , profile : 1 , _id : 1 , phone : 1}
    };


    Request.aggregate(
            {$match : match},
            {$lookup : sendUserLookup},
            {$lookup : getUserLookup},
            {$project : projects}
        ).unwind("getUserObj" , "sendUserObj").exec(function (err, message) {
        if(err){return handleError(res, err)};
        return res.status(200).json(message[0]);
    });

};


/**
 * Get list count of sale
 */
exports.count = function(req, res) {
    if(req.query){
        var q = isJson(req.query.where);
        Request.count(q).exec(function (err, count) {
            if(err) { return handleError(res, err); }
            return res.status(200).json([{count:count}]);
        });
    }else{
        Request.count(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }
};

/**
 * Creates a new Request
 */
exports.create = function (req, res, next) {

    Request.create(req.body, function(err, message) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(message);
        });
};

/**
 * Get Message
 */
exports.getMessage = function(req, res) {

    var userId = req.params.id;

    var limit = isJson(req.query.limit);
    var sort = isJson(req.query.sort);
    var skip = isJson(req.query.skip);

    var match = {
        getUid : mongoose.Types.ObjectId(userId)
        ,'status.val' : "201"
    }

    var userLookup = {from: "users", localField: "sendUid", foreignField : "_id", as : "userObj"};

    var projects = {
        regDate : 1
        ,views : 1
        ,phoneStatus : 1
        ,content : 1
        ,status : 1
        ,sendStatus : 1
        ,userObj : { name : 1 , email : 1 , profile : 1 , _id : 1 , phone : 1}
    };

    var obj = {};
    var promises = [
        getList().then(function (response) {
            obj.message = response
        }),
        getCount().then(function (response) {
            obj.totalCount = response

        })

    ];

    Q.all(promises).then(function(response){
        return res.status(200).json(obj);
    },function (err) {
        return handleError(res, err);
    });

    function getList() {
        var deferred = Q.defer();

        Request.aggregate({$match : match} , {$sort : sort} ,{ $skip : skip },{ $limit : limit }, {$lookup : userLookup} , {$project : projects} ).unwind("userObj").exec(function (err, message) {
            if(err) deferred.reject(err);
            else  deferred.resolve(message);
        });
        return deferred.promise;
    }

    function getCount() {
        var deferred = Q.defer();

        Request.count(match).exec(function (err, count) {
            if(err) deferred.reject(err);
            else  deferred.resolve(count);
        });
        return deferred.promise;
    }



};
/**
 * send Request
 */
exports.sendMessage = function(req, res) {

    var userId = req.params.id;

    var limit = isJson(req.query.limit);
    var sort = isJson(req.query.sort);
    var skip = isJson(req.query.skip);

    var match = {
        sendUid : mongoose.Types.ObjectId(userId)
        // , "reqType" : req.query.reqType
        ,'sendStatus.val' : "201"
    }

    var userLookup = {from: "users", localField: "getUid", foreignField : "_id", as : "userObj"};

    var projects = {
        regDate : 1
        ,views : 1
        ,phoneStatus : 1
        ,content : 1
        ,status : 1
        ,sendStatus : 1
        ,userObj : { name : 1 , email : 1 , profile : 1 , _id : 1 , phone : 1}
    }

    var obj = {};
    var promises = [
        getList().then(function (response) {
            obj.message = response
        }),
        getCount().then(function (response) {
            obj.totalCount = response

        })

    ];

    Q.all(promises).then(function(response){
        return res.status(200).json(obj);
    },function (err) {
        return handleError(res, err);
    });

    function getList() {
        var deferred = Q.defer();

        Request.aggregate({$match : match} , {$sort : sort} ,{ $skip : skip },{ $limit : limit }, {$lookup : userLookup} , {$project : projects} ).unwind("userObj").exec(function (err, message) {
            if(err) deferred.reject(err);
            else  deferred.resolve(message);
        });
        return deferred.promise;
    }

    function getCount() {
        var deferred = Q.defer();

        Request.count(match).exec(function (err, count) {
            if(err) deferred.reject(err);
            else  deferred.resolve(count);
        });
        return deferred.promise;
    }

};
/**
 * delete Request
 */
exports.deleteMessage = function(req, res) {

    var userId = req.params.id;

    var limit = isJson(req.query.limit);
    var sort = isJson(req.query.sort);
    var skip = isJson(req.query.skip);

    var match = {
        getUid : mongoose.Types.ObjectId(userId)
        // , "reqType" : req.query.reqType
        ,'status.val' : "301"
    }

    var userLookup = {from: "users", localField: "sendUid", foreignField : "_id", as : "userObj"};

    var projects = {
        regDate : 1
        ,views : 1
        ,phoneStatus : 1
        ,content : 1
        ,status : 1
        ,sendStatus : 1
        ,userObj : { name : 1 , email : 1 , profile : 1 , _id : 1 , phone : 1}
    };

    var obj = {};
    var promises = [
        getList().then(function (response) {
            obj.message = response
        }),
        getCount().then(function (response) {
            obj.totalCount = response

        })

    ];

    Q.all(promises).then(function(response){
        return res.status(200).json(obj);
    },function (err) {
        return handleError(res, err);
    });

    function getList() {
        var deferred = Q.defer();

        Request.aggregate({$match : match} , {$sort : sort} ,{ $skip : skip },{ $limit : limit }, {$lookup : userLookup} , {$project : projects} ).unwind("userObj").exec(function (err, message) {
            if(err) deferred.reject(err);
            else  deferred.resolve(message);
        });
        return deferred.promise;
    }

    function getCount() {
        var deferred = Q.defer();

        Request.count(match).exec(function (err, count) {
            if(err) deferred.reject(err);
            else  deferred.resolve(count);
        });
        return deferred.promise;
    }


};

// Updates an existing message in the DB.
exports.update = function(req, res) {
    var _id = req.body.messageId;
    if(!req.body.views) {req.body.modDate = Date.now();}

    Request.findById(_id, function (err, message) {
        if(err) return res.status(500).send(err);
        if(!message) { return res.status(404).send('해당 메세지가 없습니다'); }
        var updated = _.merge(message, req.body);
        updated.save(function (err) {
            if (err) { return res.status(500).send(err); }
            return res.status(200).json({status : 200});
        });
    });
};


function handleError(res, err) {
    console.log(err)
    return res.status(500).send(err);
}
function isJson(str) {
    try {
        str = JSON.parse(str);
    } catch (e) {
        str = str;
    }
    return str
}




