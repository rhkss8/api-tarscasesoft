var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('lodash');

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'ACCOUNT_NOT_CORRECT' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'PASSWORD_NOT_CORRECT' });
        }

        _.extend(user,{
          loginDate : Date.now()
        });

        user.save(function (err, result) {
          if (err) return done(err);
          return done(null, result);
        });
      });
    }
  ));
};
