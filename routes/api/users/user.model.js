'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  role: {
      type: String,
      default: 'user'
  },
  provider: String,
  salt: String,

  email: { type: String, lowercase: true },
  hashedPassword: String,

  name: String,
  phone: String,
  site: {type: String, default: 'Y'},
  gender:String,
  age : Number,
  city : String,
  birth: Object({
    year : String,
    month: String,
    day: String
  }),
  photo: Object({
    name : String,
    url: String,
    thumb_url: String
  }),
  company : Object({
     shop_name : String,//상사명
     biz_name : String,//사업자명
     biz_num : String,//사업자번호
     biz_phone : String,//상사전화번호
     biz_city : String,//매매단지(지역)
     biz_shop : String,//매매단지
     biz_address : String,
     biz_address_detail : String,
     biz_desc : String,
     homepage:String,
     dealer_num : String,
     joined_from : String,//가입경로 0 : 지인, 1: 인터넥
     photo: Object({
        name : String,
        url: String,
        thumb_url: String
      })
  }),
  add: Object({
    count : {type: Number, default: 0},
    expire_dt : Date
  }),
  alarm : Object({//이벤트 동의
      email : Boolean,
      sms : Boolean,
      push : Boolean
  }),
  change_biz : Object({//상사정보 변경요청시
      text : String,
      date : Date
  }),
  review : Object({
    count : {type: Number, default: 0},
    grade : {type: Number, default: 0}
  }),
  regDate: {type: Date, default: Date.now},
  modDate: {type: Date, default: Date.now},
  mypageDate: {type: Date, default: Date.now},
  loginDate : Date,
  status: Object({ name: String, val: {type : String , default : '301'}}),// 201 사용중 , 301 심사대기, 401 밴, 501 삭제, 601 장기휴먼계정
  facebook: {},
  twitter: {},
  google: {}
});

/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

// UserSchema
//     .virtual('homepage')
//     .set(function(homepage) {
//         console.log('func')
//         console.log(pageAddress)
//         return this.homepage = String;
//     });
//
// UserSchema.

// Public profile information
// UserSchema
//     .virtual('profile')
//     .get(function() {
//         return {
//             'name': this.name,
//             'role': this.role
//         };
//     });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function() {
        return {
            '_id': this._id,
            'role': this.role
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(function(email) {
        if (authTypes.indexOf(this.provider) !== -1) return true;
        return email.length;
    }, 'Email cannot be blank');

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function(hashedPassword) {
        if (authTypes.indexOf(this.provider) !== -1) return true;
        return hashedPassword.length;
    }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
    .path('email')
    .validate(function(value, respond) {
        var self = this;
        this.constructor.findOne({email: value}, function(err, user) {
            if(err) throw err;
            if(user) {
                if(self.id === user.id) return respond(true);
                return respond(false);
            }
            respond(true);
        });
    }, '이미 사용중인 이메일입니다');

var validatePresenceOf = function(value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function(next) {
        if (this.company && this.company.homepage)
            this.company.homepage = this.company.homepage.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        if (!this.isNew) return next();
        if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
            next(new Error('Invalid password'));
        else
            next();
    });

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64,'sha1').toString('base64');
    }
};

module.exports = mongoose.model('User', UserSchema);
