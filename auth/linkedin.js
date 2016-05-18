var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin');

var User = require('../models/user');
var config = require('../_config');
var init = require('./init');

passport.use(new LinkedInStrategy({
  consumerKey: config.linkedin.clientID,
  consumerSecret: config.linkedin.clientSecret,
  callbackURL: config.linkedin.callbackURL
}, // get user info from their LinkedIn account
function(token, tokenSecret, profile, done) {
  var searchQuery = {
    name: profile.displayName
  };
  
  var updates = {
    name: profile.displayName,
    someID: profile.id
  };
  
  var options = {
    upsert: true
  };
  
  User.findOneAndUpdate(searchQuery, updates, options, function(error, user) {
    if (error) {
      return done(error);
    }
    else {
      return done(null, user);
    }
  });
}));

init();

module.exports = passport;