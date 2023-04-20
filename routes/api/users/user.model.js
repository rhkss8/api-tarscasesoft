'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const authTypes = ['twitter', 'facebook', 'google'];

const UserSchema = new Schema({
  role: {
      type: String,
      default: 'user'
  },
  provider: String,
  salt: String,
  id: String,
  email: { type: String, lowercase: true },
  hashedPassword: String,
  name: String,
  phone: String,
  gender:String,
  age : Number,
  city : String,
  regDate: {type: Date, default: Date.now},
  modDate: {type: Date, default: Date.now},
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
        if (authTypes.indexOf(this.provider) !== -1) {
          return Promise.resolve(true)
        }
        return Promise.resolve(email.length)
    }, 'Email cannot be blank')

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function(hashedPassword) {
        if (authTypes.indexOf(this.provider) !== -1) {
          return Promise.resolve(true)
        }
        return Promise.resolve(hashedPassword.length);
    }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
    .path('email')
    .validate(async function (value, respond) {
      await this.constructor.findOne({email: value})
        .then((user) => {
          if (user) {
            return Promise.reject({ code: 'ERR_DUPE_ACCOUNT' })
          } else {
            return Promise.resolve(true)
          }
        }).catch((err) => {
          return Promise.reject(err)
        });
    });

const validatePresenceOf = function(value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function(next) {
        if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
            next({ code: 'ERR_INVALID_SAVE' });
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
        const salt = Buffer.from(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64,'sha1').toString('base64');
    }
};

module.exports = mongoose.model('User', UserSchema);
