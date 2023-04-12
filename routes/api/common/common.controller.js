/**
 * Created by rhkss8 on 2016. 9. 2..
 */
'use strict';

var fs = require('fs'),
    Blog = require('../blog/blog.model'),
    Sale = require('../sale/sale.model'),
    User = require('../users/user.model'),
    path = require('path'),
    mime = require('mime'),
    _ = require('lodash'),
    Q = require('q');
var mongoose = require('mongoose');

function handleError(res, err) {
    console.log(err)
    return res.status(500).send(err);
};
function isJson(str) {
    try {
        str = JSON.parse(str);
    } catch (e) {
        str = str;
    }
    return str
};


/**
 * Get upload
 */
exports.index = function(req, res) {
    res.send('common index')
};
/**
 * Get dashboard
 * update mypageDate
 * get blog-count , sale-count
 */
exports.dashboard = function(req, res) {


    var userId = req.params.id;

    var q = isJson(req.query.where);
    var sort = isJson(req.query.sort);
    var select = isJson(req.query.select);

    //신규 댓글 가져오가

    var entity = {
        blogCount : 0
        , saleCount : 0
        , blogArr : []
        , addUserArr : []
        , messageCount : 0
    };

    var promises =[getBlogCount() , getSaleCount(), getDashboard(), getAddMe(), getNewMessage(), updateMyPageDate()];

    Q.all(promises).then(function (response) {
        return res.status(200).json(entity);

    },function (err) {
        return handleError(res, err);
    })

    function getBlogCount(){
        var deferred = Q.defer();

        Blog.count({uid : q.uid , "status.val" : q.status}).exec(function (err, count) {
            if(err) { deferred.reject(err) }
            entity.blogCount = count;
            deferred.resolve({blogCount : count});
        });

        return deferred.promise;
    }

    function getSaleCount(){
        var deferred = Q.defer();

        Sale.count({uid : q.uid, "status.val" : q.status}).exec(function (err, count) {
            if(err) { deferred.reject(err) }
            entity.saleCount = count;
            deferred.resolve({saleCount : count});
        });

        return deferred.promise;
    }

    function getNewMessage(){
        var deferred = Q.defer();

        User.findById(q.uid).exec(function (err, users) {
            if(err) { deferred.reject(err) }
            if(!users) { return res.status(404).send('Not Found'); }

            _.each(users.getMessage,function (val) {
                if(val.regDate > users.mypageDate) entity.messageCount ++
            })
            deferred.resolve({count : entity.messageCount});
        });

        return deferred.promise;
    }

    function getAddMe(){
        var deferred = Q.defer();

        User.find({"writer.postId" : q.uid},' name phone _id profile email').exec(function (err, products) {
            if(err) { deferred.reject(err) }
            entity.addUserArr = products;
            deferred.resolve({saleCount : products});
        });

        return deferred.promise;
    }

    function getDashboard(){

        var deferred = Q.defer();

        var param = q;
        delete param.status;
        Blog.find(q).exec(function (err, products) {
            if(err) { deferred.reject(err) }
            entity.blogArr = products;
            deferred.resolve({blogArr : products});
        });

        return deferred.promise;
    }

    function updateMyPageDate() {
        var deferred = Q.defer();
        User.findById(q.uid).exec(function (err, users) {
            if(err) { deferred.reject(err) }
            if(!users) { return res.status(404).send('Not Found'); }
            var change = {
                mypageDate : Date.now()
            }
            var update = _.merge(users, change);
            update.save(function (err) {
                if (err) { return handleError(res, err); }
                deferred.resolve({update : 201});
            });
        });

        return deferred.promise;
    }

};



