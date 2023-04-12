/**
 * Created by rhkss8 on 2016. 9. 3..
 */
'use strict';

var AddProduct = require('./../add/add-product.model');
var Add = require('./../add/add.model');
var Coupon = require('./../coupon/coupon.model');
var _ = require('lodash');
var config = require('../../../config/environment/index');
var mongoose = require('mongoose');
var Q = require('q');
var shortId = require('shortid');
var dateFormat = require('dateformat');

/**
 * Get list of Add
 */
exports.index = function(req, res) {

    if(req.query){
        var q = isJson(req.query.where);

        AddProduct.find(q).exec(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }else{
        AddProduct.find(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }
};

/**
 * Get single of add
 **/
exports.view = function (req, res) {

    var id = req.params.id;

    Add.findById(id,function (err, add) {
        if(err) return handleError(res, err);
        if(!add) res.status(500).json({msg : '해당 주문이없습니다.'});
        res.status(200).json(add);

    })
}

/**
 * Get order list of Add
 */
exports.order = function(req, res) {

    var match = {};
    var obj = {};
    var limit = isJson(req.query.limit);
    var sort = isJson(req.query.sort);
    var skip = isJson(req.query.skip);

    if(!!req.query.admin){
        if(!!req.query.status) match = { "status.val" : req.query.status}
    } else {
        if(!!req.query.status){
            match = {"uid" : mongoose.Types.ObjectId(req.query.uid), "status.val" : req.query.status}
        } else {
            match = {"uid" : mongoose.Types.ObjectId(req.query.uid)}
        }
    }

    // var group = {
    //     _id : {
    //         orderNo : '$orderNo',
    //         status : '$status.val'
    //     },
    //     items : {$push : '$$ROOT'},
    //     totalPrice : {$sum : '$price'},
    //     // regDate: { $avg: "$regDate" },
    //     count : {$sum : 1}
    // }


    var promises = [
        getList().then(function (response) {
            obj.orders = response
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

        var productLookup = {from: "addproducts", localField: "orderNo", foreignField : "orderNo", as : "products"}

        Add.aggregate({$match : match} ,{$sort : sort} ,{$lookup : productLookup} , { $skip : skip } ,{ $limit : limit }).exec(function (err, products) {
            if(err) deferred.reject(err);
            else  deferred.resolve(products);
        });
        return deferred.promise;
    }

    function getCount() {
        var deferred = Q.defer();

        Add.aggregate({$match : match}).exec(function (err, products) {
            if(err) deferred.reject(err);
            else  deferred.resolve(products.length);
        });
        return deferred.promise;
    }

};

/**
 * Get list of Add what is possible to add
 */
exports.add = function(req, res) {

    var sort = isJson(req.query.sort);

    var saleLookup = {};
    var project = {};

    var match = {
        "status.val" : req.query.status,
        orderType : req.query.orderType,
        startsAt : {$gte : new Date(req.query.startDay), $lt : new Date(req.query.endDay)}
    };


    if(req.query.orderType === 'R01'){

        //컨설턴트 광고
        saleLookup = {from: "users", localField: "saleId", foreignField : "_id", as : "saleObj"};
        project = {
            orderNo : 1,
            saleObj : {name : 1, email : 1 , profile : 1, intro : 1, _id : 1}
        };

        AddProduct.aggregate({$match : match} , {$lookup : saleLookup} , {$project : project} , {$sort : sort}).unwind("saleObj").exec(function (err, products) {
            if(err) handleError(res, err);
            else res.status(200).json(products);
        });

    } else {
        saleLookup = {from: "sales", localField: "saleId", foreignField : "_id", as : "saleObj"};

        AddProduct.aggregate({$match : match} , {$lookup : saleLookup} , {$sort : sort}).unwind("saleObj").exec(function (err, products) {
            if(err) handleError(res, err);
            if(products.length == 0){
                var match = {
                    "status.val" : req.query.status,
                    orderType : req.query.orderType,
                }
                AddProduct.aggregate({$match : match} , {$lookup : saleLookup} , {$sort : sort} , {$limit : req.query.max - products.length}).unwind("saleObj").exec(function (err, reProducts) {

                    if(err) handleError(res, err);
                    else res.status(200).json(reProducts);
                });
            } else {
                res.status(200).json(products);
            }
        });
    }



};

/**
 * Get list count of Add
 */
exports.count = function(req, res) {
    if(req.query){
        var q = isJson(req.query.where);
        Add.count(q).exec(function (err, count) {
            if(err) { return handleError(res, err); }
            return res.status(200).json([{count:count}]);
        });
    }else{
        Add.count(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }
};

/**
 * Get list count of add type one
 */
exports.countOne = function(req, res) {

    if(req.query){
        var q = isJson(req.query.where);
        Add.count(q).exec(function (err, count) {
            if(err) { return handleError(res, err); }
            return res.status(200).json({count:count});
        });
    }else{
        Add.count(function (err, products) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(products);
        });
    }
};

/**
 * Creates a new add
 */
exports.create = function (req, res, next) {

    var products = isJson(req.body.products);
    var order = isJson(req.body.order);
    var orderNo = dateFormat(new Date(), "yyyymmddhMMss")+shortId.generate();

    //주문생성
    function createAdd() {
        order.orderNo = orderNo;
        if(order.totalPrice < 0) order.totalPrice = 0;
        Add.create(order, function(err, add) {
            if(err) return handleError(res, err);
            if(products.length > 0){
                createAddProduct(add);
            }
        });
    }

    //주문생성 후 주문상품생성
    function createAddProduct(add) {
        var promises = [];
        _.each(products,function(val){
            promises.push(createProduct(val, orderNo).then(function(response){
            }));
        })

        Q.all(promises).then(function(response){
            if(order.coupons.length > 0) removeCoupon();
            return res.status(200).json(add);
        },function (err) {
            return handleError(res, err);
        });
    }

    //사용된 쿠폰 지우기
    function removeCoupon() {
        var update = {
                status : {name : 'coupon used' , val : 301},
                modDate : Date.now()
            },
            options = {
                multi : true /* update all records that match the query object, default is false (only the first one found is updated) */
            }
        _.each(order.coupons,function(val){
            Coupon.update({_id : val._id}, update, options, function (err, coupon) {
            });

        })
    }

    //상품생성 Q promise
    function createProduct(val,orderNo) {
        var deferred = Q.defer();

        req.body.blogNo = shortId.generate();

        var entity = {
            saleId: val._id
            ,uid: val.orderId
            ,title: val.title
            ,orderNo: orderNo
            ,orderType: val.orderType
            ,price : val.add_price
            ,type: val.type
            ,startsAt: val.startsAt
            ,draggable: val.draggable
            ,color: val.color
        }


        AddProduct.create(entity, function(err, add) {
            if(err) deferred.reject(err);
            else  deferred.resolve(add);
        });
        return deferred.promise;
    }

    createAdd();

};

// Updates an existing message in the DB.
exports.update = function(req, res) {

    var adds = isJson(req.body.orders);
    var status = isJson(req.body.status);

    var update = {
            status : {name : 'add paid' , val : status},
            modDate : Date.now()
        },
        options = {
            multi : true /* update all records that match the query object, default is false (only the first one found is updated) */
        }

    Add.update({_id : adds._id}, update, options,function (err, add) {
        if(err) return handleError(res, err);
        AddProduct.update({orderNo : adds.orderNo}, update, options,function (err, products) {
            if(err) return handleError(res, err);
            res.status(200).json(products)
        })

    })

};

exports.addUpdate = function (req,res) {

    var params = req.body.orders;

    var promises = [];
    _.each(params,function(val){
        promises.push(updateAdd(val).then(function(response){
        }));
    })


    Q.all(promises).then(function(response){
        return res.status(200).json({status:200});
    },function (err) {
        return handleError(res, err);
    });

    function updateAdd(val) {
        var deferred = Q.defer();
        AddProduct.findById(val._id, function (err, add) {
            if(err) return deferred.reject(err);
            if(!add) { return deferred.reject('해당 광고가 없습니다'); }

            if(!req.body.views) {val.modDate = Date.now()};
            var updated = _.merge(add, val);
            updated.save(function (err) {
                if(err) deferred.reject(err);
                else  deferred.resolve(add);
            });
        });
        return deferred.promise;
    }

}

// Updates an existing message in the DB.
exports.viewUpdate = function(req, res) {

    AddProduct.findById(req.params.id, function (err, add) {
        if(err) return handleError(res, err);
        if(!add) { return res.status(500).json({message:'해당 광고가 없습니다'}) }

        add.views ++

        add.save(function (err) {
            if(err) handleError(res, err);
            else  return res.status(200).json({message:'done'});
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




