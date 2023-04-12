'use strict';

var SellHelloMyCar = require('./sellhellomycar.model');
var BuyHelloMyCar = require('./buyhellomycar.model');
var RentHelloMyCar = require('./renthellomycar.model');
var nasServiceLog = require('./nasServiceLog.model');
var Utils = require('../../../config/utils');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var request = require('request');

/**
 * Get list of sell list
 */
exports.index = function (req, res) {
  var q = Utils.isJson(req.query.where);
  var limit = req.query.limit ? parseInt(req.query.limit) : 50
  var sort = req.query.sort ? req.query.sort : {regDate : 1}
  var skip = req.query.offset ? parseInt(req.query.offset) : 0

  if (q.start_date && q.end_date) {
    q.regDate = {$gte: q.start_date, $lt: q.end_date}
    delete q.start_date
    delete q.end_date
  }

  async.waterfall([
    function getItems(cb) {
      SellHelloMyCar.find(q).skip(skip).limit(limit).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }, function getCount(users, cb) {
      SellHelloMyCar.count(q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: users, count: count});
      });
    }, function getTotalCount(data, cb) {
      SellHelloMyCar.count().exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, _.extend(data, {totalCount: count}));
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

exports.getNasLog = function (req, res) {
  var q = Utils.isJson(req.query.where);
  var limit = req.query.limit ? parseInt(req.query.limit) : 50
  var sort = req.query.sort ? req.query.sort : {regDate : 1}
  var skip = req.query.offset ? parseInt(req.query.offset) : 0

  if (q.start_date && q.end_date) {
    q.regDate = {$gte: q.start_date, $lt: q.end_date}
    delete q.start_date
    delete q.end_date
  }

  console.log(q)

  async.waterfall([
    function getItems(cb) {
      nasServiceLog.find(q).skip(skip).limit(limit).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }, function getCount(users, cb) {
      nasServiceLog.count(q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: users, count: count});
      });
    }, function getTotalCount(data, cb) {
      nasServiceLog.count().exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, _.extend(data, {totalCount: count}));
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

exports.getBuy = function (req, res) {
  var q = Utils.isJson(req.query.where);
  var limit = req.query.limit ? parseInt(req.query.limit) : 50
  var sort = req.query.sort ? req.query.sort : {regDate : 1}
  var skip = req.query.offset ? parseInt(req.query.offset) : 0

  if (q.start_date && q.end_date) {
    q.regDate = {$gte: q.start_date, $lt: q.end_date}
    delete q.start_date
    delete q.end_date
  }

  async.waterfall([
    function getItems(cb) {
      BuyHelloMyCar.find(q).skip(skip).limit(limit).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }, function getCount(users, cb) {
      BuyHelloMyCar.count(q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: users, count: count});
      });
    }, function getTotalCount(data, cb) {
      BuyHelloMyCar.count().exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, _.extend(data, {totalCount: count}));
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

exports.getRent = function (req, res) {
  var q = Utils.isJson(req.query.where);
  var limit = req.query.limit ? parseInt(req.query.limit) : 50
  var sort = req.query.sort ? req.query.sort : {regDate : 1}
  var skip = req.query.offset ? parseInt(req.query.offset) : 0

  if (q.start_date && q.end_date) {
    q.regDate = {$gte: q.start_date, $lt: q.end_date}
    delete q.start_date
    delete q.end_date
  }

  async.waterfall([
    function getItems(cb) {
      RentHelloMyCar.find(q).skip(skip).limit(limit).sort(sort).exec(function (err, result) {
        if (err) return cb(err);
        else cb(null, result);
      });
    }, function getCount(users, cb) {
      RentHelloMyCar.count(q).exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, {rows: users, count: count});
      });
    }, function getTotalCount(data, cb) {
      RentHelloMyCar.count().exec(function (err, count) {
        if (err) return cb(err);
        else cb(null, _.extend(data, {totalCount: count}));
      });
    }
  ], function (err, data) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: data});
  });
};

/**
 * Creates a new sell list
 */
exports.create = function (req, res, next) {

  var tryCount = 0;
  var req_body = req.body

  function createNasLog () {
    var params = {
      certNum: req_body.certNum,
      naskey: req_body.naskey,
      CI: req_body.CI,
      DI: req_body.DI,
      phoneNo: req_body.phoneNo,
      birthDay: req_body.birthDay,
      name: req_body.name,
      ip: req_body.ip
    }

    var options = {
      uri:'http://www.appang.kr/nas/api/complete.cpa.json.asp?naskey='+req_body.naskey,
      method: 'POST'
    }
    request.post(options, function(err,httpResponse,body){
      if(httpResponse.statusCode === 200) {
        params = _.extend(params, {
          tryCount: tryCount,
          success: true
        });
        nasServiceLog.create(params, function (err, result) {
          if (err) {
            console.log('nasServiceLog fail...')
          } else {
            console.log('nasServiceLog success!!!')
          }
          console.log('naskey' + req_body.naskey)
          console.log('name' + req_body.phoneNo)
        });
      } else {
        tryCount += 1;

        // 5회 재시도 실패시 에러에 대한 로그
        if(tryCount >= 5) {
          params = _.extend(params, {
            tryCount: tryCount,
            success: false
          });
          nasServiceLog.create(params, function (err, result) {
            if (err) {
              console.log('nasServiceLog retry over fail...')
            } else {
              console.log('nasServiceLog retry over success!!!')
            }
            console.log('naskey' + req_body.naskey)
            console.log('name' + req_body.phoneNo)
          });
        } else {
          console.log('nasServiceLog fail try re request..' + req_body.naskey)
          setTimeout(function(){
            console.log('nasServiceLog fail try re start..' + tryCount)
            createNasLog()
          },1000 * 60 * 5)
        }
      }

    })
  }

  async.waterfall([
    function findExist(cb) {
      var match = {
        certNum: req.body.certNum
      };
      SellHelloMyCar.findOne(match).exec(function (err, result) {
        cb(null, result);
      });
    }, function getRoom(room, cb) {
      if (room) {
        return cb('중복된 인증 요청입니다.');
      }

      SellHelloMyCar.create(req_body, function (err, result) {
        if (err) {
          return cb(err)
        }
        cb(null, result);
      });
    }
  ], function (err, result) {
    if (err) {
      if(typeof err === 'string') {
        if (err) return res.status(406).json(err);
      } else {
        if (err) return Utils.handleError(res, err);
      }
    } else {

      if(req_body.naskey) {
        createNasLog(req_body)
      }

      return res.status(200).json({data: result});
    }
  });
};

exports.buy = function (req, res, next) {

  var tryCount = 0;
  var req_body = req.body;

  function createNasLog () {
    var params = {
      certNum: req_body.certNum,
      naskey: req_body.naskey,
      CI: req_body.CI,
      DI: req_body.DI,
      phoneNo: req_body.phoneNo,
      birthDay: req_body.birthDay,
      name: req_body.name,
      ip: req_body.ip
    }

    var options = {
      uri:'http://www.appang.kr/nas/api/complete.cpa.json.asp?naskey='+req_body.naskey,
      method: 'POST'
    }
    request.post(options, function(err,httpResponse,body){
      if(httpResponse.statusCode === 200) {
        params = _.extend(params, {
          tryCount: tryCount,
          success: true
        });
        nasServiceLog.create(params, function (err, result) {
          if (err) {
            console.log('nasServiceLog fail...')
          } else {
            console.log('nasServiceLog success!!!')
          }
          console.log('naskey' + req_body.naskey)
          console.log('name' + req_body.phoneNo)
        });
      } else {
        tryCount += 1;

        // 5회 재시도 실패시 에러에 대한 로그
        if(tryCount >= 5) {
          params = _.extend(params, {
            tryCount: tryCount,
            success: false
          });
          nasServiceLog.create(params, function (err, result) {
            if (err) {
              console.log('nasServiceLog retry over fail...')
            } else {
              console.log('nasServiceLog retry over success!!!')
            }
            console.log('naskey' + req_body.naskey)
            console.log('name' + req_body.phoneNo)
          });
        } else {
          console.log('nasServiceLog fail try re request..' + req_body.naskey)
          setTimeout(function(){
            console.log('nasServiceLog fail try re start..' + tryCount)
            createNasLog()
          },1000 * 60 * 5)
        }
      }

    })
  }

  async.waterfall([
    function findExist(cb) {
      var match = {
        certNum: req.body.certNum
      };
      BuyHelloMyCar.find(match).exec(function (err, result) {
        cb(null, result);
      });
    }, function findNaskey(result, cb) {
      if (result.length > 0) {
        return cb('중복된 인증 요청입니다.');
      }
      var match = {
        '$or': [
          {
           'naskey': req.body.naskey
          },
          {
          'phoneNo': req.body.phoneNo
        }]
      };
      BuyHelloMyCar.find(match).exec(function (err, result) {
        cb(null, result);
      });
    }, function createDB(result, cb) {
      if (result.length > 0) {
        console.warn('중복된 신청 요청입니다.')
        console.log(result)
        return cb(null, '중복된 신청 요청입니다.');
      }

      BuyHelloMyCar.create(req_body, function (err, result) {
        if (err) {
          return cb(err)
        }
        cb(null, result);
      });
    }
  ], function (err, result) {
    if (err) {
      if(typeof err === 'string') {
        if (err) return res.status(406).json(err);
      } else {
        if (err) return Utils.handleError(res, err);
      }
    } else {
      if(typeof result === 'string') {
        return res.status(208).json({data: result});
      } else {
        if(req_body.naskey) {
          createNasLog(req_body)
        }

        return res.status(200).json({data: result});
      }
    }
  });
};

exports.rent = function (req, res, next) {

  var tryCount = 0;
  var req_body = req.body;

  function createNasLog () {
    var params = {
      certNum: req_body.certNum,
      naskey: req_body.naskey,
      CI: req_body.CI,
      DI: req_body.DI,
      phoneNo: req_body.phoneNo,
      birthDay: req_body.birthDay,
      name: req_body.name,
      ip: req_body.ip
    }

    var options = {
      uri:'http://www.appang.kr/nas/api/complete.cpa.json.asp?naskey='+req_body.naskey,
      method: 'POST'
    }
    request.post(options, function(err,httpResponse,body){
      if(httpResponse.statusCode === 200) {
        params = _.extend(params, {
          tryCount: tryCount,
          success: true
        });
        nasServiceLog.create(params, function (err, result) {
          if (err) {
            console.log('nasServiceLog fail...')
          } else {
            console.log('nasServiceLog success!!!')
          }
          console.log('naskey' + req_body.naskey)
          console.log('name' + req_body.phoneNo)
        });
      } else {
        tryCount += 1;

        // 5회 재시도 실패시 에러에 대한 로그
        if(tryCount >= 5) {
          params = _.extend(params, {
            tryCount: tryCount,
            success: false
          });
          nasServiceLog.create(params, function (err, result) {
            if (err) {
              console.log('nasServiceLog retry over fail...')
            } else {
              console.log('nasServiceLog retry over success!!!')
            }
            console.log('naskey' + req_body.naskey)
            console.log('name' + req_body.phoneNo)
          });
        } else {
          console.log('nasServiceLog fail try re request..' + req_body.naskey)
          setTimeout(function(){
            console.log('nasServiceLog fail try re start..' + tryCount)
            createNasLog()
          },1000 * 60 * 5)
        }
      }

    })
  }

  async.waterfall([
    function findExist(cb) {
      var match = {
        certNum: req.body.certNum
      };
      RentHelloMyCar.find(match).exec(function (err, result) {
        cb(null, result);
      });
    }, function findNaskey(result, cb) {
      if (result.length > 0) {
        return cb('중복된 인증 요청입니다.');
      }
      var match = {
        '$or': [
          {
            'naskey': req.body.naskey
          },
          {
            'phoneNo': req.body.phoneNo
          }]
      };
      RentHelloMyCar.find(match).exec(function (err, result) {
        cb(null, result);
      });
    }, function createDB(result, cb) {
      if (result.length > 0) {
        console.log(result)
        console.warn('중복된 신청 요청입니다.')
        return cb(null, '중복된 신청 요청입니다.');
      }

      RentHelloMyCar.create(req_body, function (err, result) {
        if (err) {
          return cb(err)
        }
        cb(null, result);
      });
    }
  ], function (err, result) {
    if (err) {
      if(typeof err === 'string') {
        if (err) return res.status(406).json(err);
      } else {
        if (err) return Utils.handleError(res, err);
      }
    } else {
      if(typeof result === 'string') {
        return res.status(208).json({data: result});
      } else {
        if(req_body.naskey) {
          createNasLog(req_body)
        }

        return res.status(200).json({data: result});
      }
    }
  });
};
