'use strict';

const User = require('./user.model');

const _ = require('lodash');
const passport = require('passport');
const Project = require('../../../config/default.project');
const config = require('../../../config/environment');
const jwt = require('jsonwebtoken');
const Q = require('q');
const mongoose = require('mongoose');
const mail = require('../../../config/mail/mailsender');
const Log = require('log'), log = new Log('info');
const Utils = require('../../../config/utils');

const async = require('async');
const dateFormat = require('dateformat'),
  date = new Date();

/**
 * Get list of users
 */
// exports.list = function (req, res) {
//   var q = isJson(req.query.where);
//   var sort = {};
//   var limit = parseInt(req.query.limit);
//   var skip = parseInt(req.query.offset);
//
//   if (req.query.sort_name && req.query.sort_order)
//     sort[req.query.sort_name] = req.query.sort_order;
//   else
//     sort = {modDate: 'desc'};
//
//   if (q.name)
//     _.extend(q, {name: new RegExp(q.name, 'i')});
//
//   var ProductLookup = {from: "products", localField: "_id", foreignField: "uid", as: "Products"};
//   var projects = {
//     name: 1
//     , company: 1
//     , email: 1
//     , intro: 1
//     , photo: 1
//     , role: 1
//     , phone: 1
//     , alarm: 1
//     , change_biz: 1
//     , regDate: 1
//     , modDate: 1
//     , mypageDate: 1
//     , status: 1
//     , facebook: 1
//     , twitter: 1
//     , google: 1
//     , products: {
//       "$filter": {
//         "input": "$Products",
//         "as": "child",
//         "cond": {"$eq": ["$$child.status.val", '201']}
//       }
//     }
//   };
//
//   async.waterfall([
//     function getItems(cb) {
//       User.aggregate(
//         {$match: q},
//         {$skip: skip},
//         {$limit: limit},
//         {$lookup: ProductLookup},
//         {$project: projects}
//       ).sort(sort).exec(function (err, users) {
//         if (err) return cb(err);
//         else cb(null, users);
//       })
//     }, function getCount(users, cb) {
//       User.count(q).exec(function (err, count) {
//         if (err) return cb(err);
//         else cb(null, {rows: users, count: count});
//       });
//     }
//   ], function (err, data) {
//     if (err) return Utils.handleError(res, err);
//     return res.status(200).json({data: data});
//   });
// };

/**
 * Creates a new users
 */
exports.create = function (req, res, next) {

  try {
    const newUser = new User(req.body);
    newUser.provider = 'local';
    if (newUser.role === 'user') {
      newUser.status = {name: 'user create', val: 201};
    } else {
      newUser.status = {name: 'user create', val: 301};
    }
    newUser.save()
      .then((user) => {
        const token = jwt.sign({_id: user._id}, config.secrets.session, {expiresIn: config.secrets.session.tokenTime});
        res.json({ data: { token: token }});
      })
      .catch((err) => {
        _.extend(err, { code: err?.code || 1000, msg: err?.errors?.email?.reason})
        return validationError(res, err);
      })
  } catch (err) {
    console.log(err);
  }
};

exports.list = function (req, res, next) {
  try {
    User.find({})
      .then((user) => {
        // res.json({ data: user});
        res.send({ data: user});
      })
      .catch((err) => {
        return validationError(res, err);
      })
  } catch (err) {
    console.log(err);
  }
};

/**
 * 유저상태변경 - admin 전용
 * @param req
 * @param res
 */
exports.status = function (req, res, next) {

  var update = _.extend(req.body, {
    modDate: Date.now(),
    status: req.body.status,
    status_update_uid: mongoose.Types.ObjectId(req.body.status_update_uid)
  });

  User.findById(req.body.user_id, function (err, result) {
    if (err) return Utils.handleError(res, err);
    if (!result) return Utils.handleError(res, {code: 10002});
    var updated = _.merge(result, update);

    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: updated});
    });
  });
};

/**
 * Get a single users
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, '-salt -hashedPassword', function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

exports.email = function (req, res) {

  User.findOne({email: req.query.email}, '-salt -hashedPassword', function (err, user) {
    if (err) return Utils.handleError(res, err);
    if (!user) return res.status(401).send({err: {code: -10002, message: 'Unauthorized'}});
    return res.status(200).json({data: user});
  });
};

/**
 * Get a single users
 */
exports.selectOne = function (req, res) {
  var userId = req.params.id;

  // User.findById(userId,'name phone profile email', function (err, user) {
  //     if (err) return next(err);
  //     if (!user) return res.status(401).send('Unauthorized');
  //     return res.status(200).json(user);
  // });

  User.findById(userId, '-salt -hashedPassword', function (err, user) {
    if (err) return Utils.handleError(res, err);
    if (!user) return res.status(401).send({err: {code: -10002, message: 'Unauthorized'}});
    return res.status(200).json({data: user});
  });
};

/**
 * 딜러정보가져오기
 */
exports.selectDealer = function (req, res) {
  var match = Utils.isJson(req.query.where);
  var projects = Project.user;

  var sort = {};
  var limit = parseInt(req.query.limit);
  var skip = parseInt(req.query.offset);

  if (req.query.sort_name && req.query.sort_order)
    sort[req.query.sort_name] = req.query.sort_order === 'desc' ? -1 : 1;
  else
    sort = {regDate: -1};

  _.extend(match, {role: 'dealer'});

  if (match.name)
    match.name = new RegExp(match.name, 'i');

  if (match.did) {
    match._id = mongoose.Types.ObjectId(match.did);
    delete match.did
  }

  User.aggregate(
    {$match: match}
    , {$sort: sort}
    , {$skip: skip}
    , {$limit: limit}
    , {$project: projects}
  ).exec(function (err, result) {
    if (err) return Utils.handleError(res, err);
    return res.status(200).json({data: result});
  });

  // User.findById(userId,'name phone profile email', function (err, user) {
  //     if (err) return next(err);
  //     if (!user) return res.status(401).send('Unauthorized');
  //     return res.status(200).json(user);
  // });

};

/**
 * 상사정보변경신청 - dealer전용
 * @param req
 * @param res
 */
exports.bizChange = function (req, res) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return Utils.handleError(res, err);
    if (!user) return res.status(401).send({err: {code: -10002, message: 'can not find user'}});

    var update = _.extend({}, {
      change_biz: {
        text: 'req',
        date: Date.now()
      }
    });
    var updated = _.merge(user, update);

    updated.save(function (err) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: updated});
    });
  });
};

/**
 * 유저정보변경
 * @param req
 * @param res
 * @param next
 */
exports.edit = function (req, res, next) {
  //TODO 파일 삭제된거 디렉토리에서 제거해줘야함
  var path, newPath, returnPath;

  //순서 : 상품 먼저 등록 > 파일업로드(성능기록,이미지,보험이력) > 업데이트 완료
  async.waterfall([
    function insert(cb) {
      var req_body = Utils.isJson(req.body.data);

      User.findById(req.params.id, function (err, user) {
        if (err) return cb(err);
        if (!user) return cb({code: 1001});

        var update = _.extend(req_body, {modDate: Date.now()});

        var updated = _.merge(user, update);


        if (update.image_del) {
          updated.photo = {};
        }

        cb(null, updated);
      });
    },
    function uploadFiles(user, cb) {

      var updated;
      path = Utils.getProductFilePath(req, 'user', user._id);
      newPath = path.newPath;
      returnPath = path.returnPath;

      var user_photo = user.photo || {};
      var biz_photo = user.company.photo || {};

      var photo;

      if (Object.keys(req.files).length > 0) {
        Object.keys(req.files).forEach(function (val) {
          var shortId = require('shortid');
          var newName = shortId.generate();

          var file = req.files[val];
          var file_type = file.fieldName;
          if (!file_type) return;

          var file_name = file.name = file.fieldName + '_' + dateFormat(date, "yyyymmddhMMss_") + newName + '_' + file.name;
          file_name = Utils.fileNameConv(file_name);//한글깨짐을 방지하기위함

          var names = file_type.split('-'); // 0 : 사진종류 , 1: org,thumb 구분

          file.dir = returnPath + '/';


          if (names[0] === 'profile') photo = user_photo;
          else photo = biz_photo;

          if (names[1] === 'org') {
            photo.url = returnPath + '/' + file_name;
            photo.name = file_name;
          } else {
            photo.thumb_url = returnPath + '/' + file_name;
          }

          Utils.fileRename(file.path, newPath + '/' + file_name, function (err) {
            if (err) return cb(err);
          });
        });

        _.merge(user.photo, user_photo);
        updated = _.merge(user.company, {photo: biz_photo});

        cb(null, updated);
      } else cb(null, user);
    },
    function (updated, cb) {
      updated.save(function (err) {
        if (err) cb(err);
        else cb(null, updated);
      });
    }

  ], function (err, updated) {
    if (err) return Utils.handleError(res, err);

    User.findById(req.params.id, function (err, product) {
      if (err) return Utils.handleError(res, err);
      return res.status(200).json({data: product});
    });

  });

};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
        if (err) return Utils.handleError(res, err);//422
        res.status(200).send({data: 'OK'});
      });
    } else {
      res.status(401).send({err: {code: -10003, message: 'not correct password'}});
    }
  });
};

exports.resetPassword = function (req, res, next) {
  var userId = req.params.id;
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    user.password = newPass;
    user.save(function (err) {
      if (err) return Utils.handleError(res, err);//422
      res.status(200).send({data: 'OK'});
    });
  });
};

exports.role = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) {
      return handleError(res, err);
    }
    if (!user) return res.status(401).send({err: {code: -10002, message: 'Unauthorized'}});
    if (req.body.role) _.extend(user, {role: req.body.role});

    user.save(function (err, result) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json({data: result});
    });
  });
};

/*====================================================================================================================*/

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
  var q = isJson(req.query.where);
  var sort = isJson(req.query.sort);
  var skip = isJson(req.query.skip);
  var limit = isJson(req.query.limit);


  User.find(q, '-salt -hashedPassword').sort(sort).limit(limit).skip(skip).exec(function (err, users) {
    if (err) return handleError(res, err);
    res.status(200).json(users)
  })

};

exports.user = function (req, res) {
  var q = isJson(req.query.where);
  var sort = isJson(req.query.sort);
  var skip = isJson(req.query.skip);
  var limit = isJson(req.query.limit);

  var obj = {};

  var promises = [
    getList().then(function (res) {
      obj.user = res;
    }),
    getCount().then(function (res) {
      obj.count = res;
    })
  ];

  Q.all(promises).then(function (response) {
    return res.status(200).json(obj)
  }, function (err) {
    return handleError(res, err);
  });

  function getCount() {
    var deferred = Q.defer();
    User.count(q).exec(function (err, count) {
      if (err) return deferred.reject(err);
      deferred.resolve(count);
    });
    return deferred.promise;
  }

  function getList() {
    var deferred = Q.defer();
    User.find(q, '-salt -hashedPassword').sort(sort).limit(limit).skip(skip).exec(function (err, users) {
      if (err) return deferred.reject(err);
      deferred.resolve(users);
    })
    return deferred.promise;
  }

};

/**
 * 컨설턴트 뷰페이지 list
 */
exports.consultantView = function (req, res, next) {
  var userId = req.params.id;

  var projects = {
    name: 1
    , company: 1
    , email: 1
    , intro: 1
    , profile: 1
    , role: 1
    , phone: 1
    , homepage: 1
    , blogArr: {
      "$filter": {
        "input": "$blogArr",
        "as": "child",
        "cond": {"$eq": ["$$child.status.val", 201]}
      }
    }
    , saleArr: {
      "$filter": {
        "input": "$saleArr",
        "as": "child",
        "cond": {"$eq": ["$$child.status.val", 201]}
      }
    }
    , favorites: {name: 1, email: 1}
  };

  var saleLookup = {from: "sales", localField: "_id", foreignField: "uid", as: "saleArr"};
  var blogLookup = {from: "blogs", localField: "_id", foreignField: "uid", as: "blogArr"};
  var userLookup = {from: "users", localField: "email", foreignField: "writer.email", as: "favorites"};

  User.aggregate(
    {$match: {"_id": mongoose.Types.ObjectId(userId)}}
    , {$lookup: saleLookup}
    , {$lookup: blogLookup}
    , {$lookup: userLookup}
    , {$project: projects}
    , {
      $project: {
        name: 1
        , company: 1
        , email: 1
        , intro: 1
        , profile: 1
        , role: 1
        , phone: 1
        , homepage: 1
        , blog_count: {$size: '$blogArr'}
        , sale_count: {$size: '$saleArr'}
        , favorites: 1
      }
    }
  ).exec(function (err, users) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(users[0]);
  })
};

/**
 * Get list count of users
 */
exports.count = function (req, res) {
  if (req.query) {
    var q = isJson(req.query.where);
    User.count(q).exec(function (err, count) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json([{count: count}]);
    });
  } else {
    User.count(function (err, products) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(products);
    });
  }
};

/**
 * 아이디 찾기
 * @param req
 * @param res
 * @param next
 */
exports.findId = function (req, res, next) {

  var body = req.body;

  var match = {
    name: body.name,
    phone: body.phone
  };

  User.find(match).exec(function (err, users) {
    if (err) return Utils.handleError(res, err);
    if (!users.length) return res.status(200).json({data: {error: '입력하신 정보에 맞는 계정이 없습니다.'}});

    var result = [];
    (users||[]).forEach(function (user) {
      result.push(_.extend(user,{email : Utils.emailMasking(user.email)}))
    });

    res.status(200).json({data: {users : result}});

  });
};

/**
 * Re-password with e-mail
 */
exports.findPass = function (req, res, next) {

  var body = req.body;

  var match = {
    name: body.name,
    email: body.email
  };

  User.findOne(match).exec(function (err, user) {

    if (err) return Utils.handleError(res, err);
    if (!user) return res.status(200).json({data: {error: '입력하신 정보에 맞는 계정이 없습니다.'}});
    var shortId = require('shortid');
    var newPass = shortId.generate();

    user.password = newPass;
    user.save(function (err) {
      if (err) return validationError(res, err);
      mail.rePasswordToMail(body.email, user, newPass,function (error, result) {
        if(error) return;
        if(!result.accepted) result.accepted = [];
        res.status(200).send({data : {email : result.accepted[0]}});
      });
    });

  })
};

/**
 * Re-password with e-mail
 */
exports.findPassHelloMyCar = function (req, res, next) {

  var body = req.body;

  var match = {
    name: body.name,
    email: body.email
  };

  User.findOne(match).exec(function (err, user) {

    if (err) return Utils.handleError(res, err);
    if (!user) return res.status(200).json({data: {error: '입력하신 정보에 맞는 계정이 없습니다.'}});
    var shortId = require('shortid');
    var newPass = shortId.generate();

    user.password = newPass;
    user.save(function (err) {
      if (err) return validationError(res, err);
      mail.rePasswordHelloMyCarToMail(body.email, user, newPass,function (error, result) {
        if(error) return;
        if(!result.accepted) result.accepted = [];
        res.status(200).send({data : {email : result.accepted[0]}});
      });
    });

  })
};

/**
 * Deletes a users
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

// Updates an existing userInfo in the DB.
exports.update = function (req, res) {
  var userId = req.user._id;
  if (!req.body.mypageDate && !req.body.checkRequest) {
    req.body.modDate = Date.now();
  }
  else if (!!req.body.checkRequest) {
    req.body.checkRequest = Date.now();
  }
  else if (!!req.body.mypageDate) {
    req.body.mypageDate = Date.now();
  }

  User.findById(userId, '-salt -hashedPassword', function (err, users) {
    if (err) return res.status(500).send(err);
    if (!users) {
      return res.status(404).send('해당 유저가 없습니다');
    }
    var updated = _.merge(users, req.body);
    updated.save(function (err) {
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).json(users);
    });
  });
};


// Updates an existing userInfo in the DB.
exports.ban = function (req, res) {
  var userId = req.params.id;
  req.body.modDate = Date.now();
  if (!!req.body._id) delete req.body._id;

  User.findById(userId, '-salt -hashedPassword', function (err, users) {
    if (err) return res.status(500).send(err);
    if (!users) {
      return res.status(404).send('해당 유저가 없습니다');
    }
    var updated = _.merge(users, req.body);
    updated.save(function (err) {
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).json(users);
    });
  });
};

/**
 * update favorite blog
 */
// Updates an existing sale in the DB.
exports.blog = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  var temp = {blog: []};

  temp.blog.push({postId: mongoose.Types.ObjectId(req.body.postId)});

  User.findById(req.body.uid, function (err, users) {
    if (err) {
      return handleError(res, err);
    }
    if (!users) {
      return res.status(404).send('Not Found');
    }
    var updated;
    if (!req.body.index && req.body.index != 0) {
      var duplication = _.findIndex(users.blog, function (o) {
        return o.postId == req.body.postId;
      });
      if (duplication > -1) return res.status(405).send('duplication');
      updated = _.concat(users.blog, temp.blog);
    } else {
      updated = _.remove(users.blog, function (n, t) {
        if (t != req.body.index) return n;
      });
    }
    users.blog = updated;
    users.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json({status: 200});
    });
  });
};
/**
 * update favorite sale
 */
// Updates an existing sale in the DB.
exports.sale = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  var temp = {sale: []};

  temp.sale.push({postId: mongoose.Types.ObjectId(req.body.postId)});

  User.findById(req.body.uid, function (err, users) {
    if (err) {
      return handleError(res, err);
    }
    if (!users) {
      return res.status(404).send('Not Found');
    }
    var updated;
    if (!req.body.index && req.body.index != 0) {
      var duplication = _.findIndex(users.sale, function (o) {
        return o.postId == req.body.postId;
      });
      if (duplication > -1) return res.status(405).send('duplication');
      updated = _.concat(users.sale, temp.sale);
    } else {
      updated = _.remove(users.sale, function (n, t) {
        if (t != req.body.index) return n;
      });
    }

    users.sale = updated;
    users.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json({status: 200});
    });
  });
};

/**
 * update favorite writer
 */
// Updates an existing sale in the DB.
exports.writer = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  var temp = {writer: []};
  temp.writer.push(req.body);

  User.findById(req.body.uid, function (err, users) {
    if (err) {
      return handleError(res, err);
    }
    if (!users) {
      return res.status(404).send('Not Found');
    }
    var updated;
    if (!req.body.index && req.body.index != 0) {
      var duplication = _.findIndex(users.writer, function (o) {
        return o.postId == req.body.postId;
      });
      if (duplication > -1) return res.status(405).send('duplication');
      updated = _.concat(users.writer, temp.writer);
    } else {
      updated = _.remove(users.writer, function (n, t) {
        if (t != req.body.index) return n;
      });
    }
    users.writer = updated;
    users.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json({status: 200});
    });
  });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send({err: 'Unauthorized'});
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};


const validationError = function (res, err) {
  if (!err.code) {
    _.extend(err, { code: 99 });
  }
  return res.status(400).json({err: err});
};

function handleError(res, err) {
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
