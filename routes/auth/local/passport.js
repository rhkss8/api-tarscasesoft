const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const _ = require('lodash');
// const UserModel = require('../../api/users/user.model')

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }).then((user) => {
        if (!user) {
          return done(null, false, { message: 'ACCOUNT_NOT_CORRECT' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'PASSWORD_NOT_CORRECT' });
        }


        // const query = {
        //   loginDate : Date.now()
        // }
        done(null, user);
        // User.save({ email: user.email }, query).then((result) => {
        // }).catch((err) => {
        //   return done(err);
        // })
      }).catch((err) => {
        return done(err);
      })
    }
  ));
};
