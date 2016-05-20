var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

var User = require('../models/user');
var config = require('./auth-config');
var init = require('./init');

passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL
  }, // get user info from their Twitter account
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
        User.findOne({'twitter.id': profile.id }, function(error, user) {
  		if (error) return done(error);

  		if (user) {
  			return done(null, user);
  		}
  		else {
  			// user not in DB under Twitter, so create new
  			// doc for them
  			var newUser = new User();
  			// set object properties 
  			newUser.twitter.id = profile.id;
  			newUser.twitter.token = token;
  			newUser.twitter.username = profile.username;
  			newUser.twitter.displayName = profile.displayName;
  			// save to users collection
  			newUser.save(function(error) {
  				if (error) throw error;

  				return done(null, newUser);
  			});
  		}
  	});
  });
    
  }
));

init();

module.exports = passport;