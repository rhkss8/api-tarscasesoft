/**
 * Created by rhkss8 on 2016. 9. 2..
 */
'use strict';
var mongoose = require('mongoose');
var fs = require('fs'),
    Sale = require('../sale/sale.model'),
    User = require('../users/user.model'),
    path = require('path'),
    mime = require('mime'),
    async = require('async'),
    dateFormat = require('dateformat'),
    date = new Date(),
    today = dateFormat(date, "yyyymmdd"),
    _ = require('lodash'),
    Q = require('q');
var mv = require('mv');


/**
 * Get upload
 */
exports.index = function(req, res) {
    res.send('upload index')
};

function getPath(req, type){
    var obj = {};
    var _uid = req.body.uid.replace(/[~!@\#$%<>^&*\()\-=+_\’"]/gi,'');

    var origin = req.get('origin');

    var allowedOrigins = ['http://localhost:9000', 'http://localhost:9010'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        //if local
        obj.uidPath = 'nasdb/images/' + type + '/';
        obj.newPath = 'nasdb/images/' + type + '/' + _uid + '/' + today ;//for save
        obj.returnPath = 'http://localhost:8080/images/'+ type + '/' + _uid + '/' + today;//for mainImage url
    } else {
        obj.uidPath = '/nasdb/images/' + type + '/';
        obj.newPath = '/nasdb/images/'+type + '/' + _uid + '/' + today ;
        // obj.returnPath = 'images.bd2blog.com/' + type + '/' + req.body.uid + '/' + today;
        obj.returnPath = 'https://image.bd2blog.com/' + type + '/' + _uid + '/' + today;
    }

    //if doesn't have directory create directory
    if (!fs.existsSync(obj.uidPath + _uid)){
        fs.mkdirSync(obj.uidPath + _uid);
    }
    if (!fs.existsSync(obj.newPath)){
        fs.mkdirSync(obj.newPath);
    }

    return obj;
}
/**
 * file upload
 */
exports.blogUpload = function (req, res, next) {

    var path = getPath(req, 'blog');
    var newPath =  path.newPath;
    var returnPath = path.returnPath;
    var shortId = require('shortid');
    var newName = shortId.generate();

    var files = req.files.files; // files array

    for( var i=0; i<files.length; i++ ){
        files[i].dir = returnPath + '/';
        files[i].newName = dateFormat(date, "yyyymmddhMMss_") +newName + '_' + files[i].name;

        mv(files[i].path, newPath + '/' + dateFormat(date, "yyyymmddhMMss_") +newName, function(err) {
            if (err) { return res.status(500).json(error); }
        });
    }


    res.send( req.files.files );
    // return res.status(200).json(req.files.files);
};





exports.saleInsert = function (req, res, next) {
    var path = getPath(req, 'sale');
    var newPath =  path.newPath;
    var returnPath = path.returnPath;

    var temp_files = [];
    var promises = [];

        if(Object.keys(req.files).length > 0){
            var files = [];
            Object.keys(req.files).forEach(function (val) {
                files.push(req.files[val])
            });

            if(req.body.mainImageIndex) req.body.mainImageIndex = JSON.parse(req.body.mainImageIndex);

            for( var i=0; i<files.length; i++ ){
                var shortId = require('shortid');
                var newName = shortId.generate();

                console.log('file!!!!!!!!!!!!!!');
                console.log(files[i]);
                console.log('file!!!!!!!!!!!!!!');

                files[i].dir = returnPath + '/';
                var file_name = files[i].newName = dateFormat(date, "yyyymmddhMMss_") +newName + '_' + files[i].name;
                // if(files[i].fieldName === req.body.mainImageIndex) req.body.mainImage = returnPath + '/' + file_name;

                temp_files.push({url: returnPath + '/' + file_name , name : file_name , uid : files[i].fieldName});

                promises.push(fileRename(files[i].path, newPath + '/' + file_name).then(function(res){
                    if(res != 201) {return handleError(res)}
                }))
            }
        }

        Q.all(promises).then(function(){
            Object.keys(req.body).forEach(function (key) {
                if(key === 'mainImageIndex' || key === 'mainImage') return;
                req.body[key] = JSON.parse(req.body[key]);
            });
            var uid = req.body.uid;
            var param = _.extend(req.body, {
                uid : mongoose.Types.ObjectId(uid)||{},
                fileArr : temp_files,
                status : {name:"sale posted", val:201},
                writer : {
                    name : req.body.uname,
                    email : req.body.uemail
                }
            });

            Sale.create(param, function(err, sale) {
                if(err) { return handleError(res, err); }
                return res.status(201).json(sale);
            });
        });

    // if(!req.body.uid) return res.status(403).json({code : 3});



    function fileRename(newName , oldName){
        var deferred = Q.defer();
        mv(newName, oldName, function(err){
            if(err) deferred.reject(err);
            else  deferred.resolve(201);
        });

        return deferred.promise;
    }

};

exports.saleUpdate = function (req, res, next) {

    var path = getPath(req, 'sale');
    var newPath =  path.newPath;
    var returnPath = path.returnPath;


    var temp_files = [];
    var promises = [];

    // if(req.body.fileArr.length >= 2){
    //     req.body.fileArr = JSON.parse(req.body.fileArr);
    // }


    if(req.body.mainImageIndex) req.body.mainImageIndex = JSON.parse(req.body.mainImageIndex);

    if(Object.keys(req.files).length > 0){
        var files = [];
        Object.keys(req.files).forEach(function (val) {
            files.push(req.files[val])
        });



        for( var i=0; i<files.length; i++ ){
            var shortId = require('shortid');
            var newName = shortId.generate();

            files[i].dir = returnPath + '/';
            var file_name = files[i].newName = dateFormat(date, "yyyymmddhMMss_") +newName+ '_' + files[i].name;
            // if(files[i].fieldName === req.body.mainImageIndex) req.body.mainImage = returnPath + '/' + file_name;

            temp_files.push({url: returnPath + '/' + file_name , name : file_name , uid : files[i].fieldName});

            promises.push(fileRename(files[i].path, newPath + '/' + file_name).then(function(res){
                if(res != 201) {return handleError(res)}
            }))
        }
    }

        Q.all(promises).then(function(){

            Object.keys(req.body).forEach(function (key) {
                if(key === 'mainImageIndex' || key === 'mainImage') return;
                req.body[key] = JSON.parse(req.body[key]);
            });

            if(temp_files.length > 0) {
                req.body.fileArr = req.body.fileArr.concat(temp_files);
            }

            req.body.fileArr.forEach(function (val, key) {
                if(val.image_del) req.body.fileArr.splice(key,1);
            });

            req.body.modDate = Date.now();
            req.body.status = {name:"sale update", val:201};

            Sale.findById(req.body._id, function (err, product) {
                if (err) { return handleError(res, err); }
                if(!product) { return res.status(404).send('Not Found'); }
                delete req.body.writer;

                product.fileArr = _.compact(req.body.fileArr , product.fileArr);
                product.leaseies = _.compact(req.body.leaseies , product.leaseies);
                product.work_history = _.compact(req.body.work_history , product.work_history);
                product.contacts = _.compact(req.body.contacts , product.contacts);
                var updated =  _.merge(product, req.body);
                updated.save(function (err) {
                    if (err) { return handleError(res, err); }
                    return res.status(200).json(product);
                });
            });
        });




    function fileRename(newName , oldName){
        var deferred = Q.defer();
        mv(newName, oldName, function(err){
            if(err) deferred.reject(err);
            else  deferred.resolve(201);
        });

        return deferred.promise;
    }

};


exports.userUpdate = function (req, res, next) {
    req.body.uid = req.body._id;
    var path = getPath(req, 'user');
    var newPath =  path.newPath;
    var returnPath = path.returnPath;

    var temp_files = {};
    var promises = [];

    if(Object.keys(req.files).length > 0){

        Object.keys(req.files).forEach(function (key) {
            var files = req.files[key]; // files array
            var shortId = require('shortid');
            var newName = shortId.generate();

            files.dir = returnPath + '/';
            var file_name = files.newName = dateFormat(date, "yyyymmddhMMss_") +newName+ '_' + files[i].name;
            temp_files[key] = returnPath + '/' + file_name ;

            promises.push(fileRename(files.path, newPath + '/' + file_name).then(function(res){
                if(res != 201) {return handleError(res)}
            }))
        });


    }

    Q.all(promises).then(function(){
        if(!!temp_files){
          if(temp_files.org_file) req.body.org_profile = temp_files.org_file;
          if(temp_files.thumb_file) req.body.profile = temp_files.thumb_file;
        }

        req.body.status = {name:"user updated", val:201};
        req.body.modDate = Date.now();
        var userId = req.body._id;

        User.findById(userId, function (err, users) {
            if(err) return res.status(401).send(err);
            if(!users) { return res.status(404).send('해당 유저가 없습니다'); }
            var updated = _.merge(users, req.body);
            updated.save(function (err) {
                if (err) { return handleError(res, err); }
                return res.status(200).json({status : 200});
            });
        });
    });

    function fileRename(newName , oldName){
        var deferred = Q.defer();
        mv(newName, oldName, function(err){
            if(err) deferred.reject(err);
            else  deferred.resolve(201);
        });

        return deferred.promise;
    }

};

function handleError(res, err) {
    return res.status(500).send(err);
}
