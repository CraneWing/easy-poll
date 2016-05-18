var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;

var User = require('../models/user');
var config = require('../_config');
var init = require('./init');

passport.use(new GitHubStrategy({
  clientID: config.github.clientID,
  clientSecret: config.github.clientSecret,
  callbackURL: config.github.callbackURL
}, // get user info from their LinkedIn account
function(accessToken, refreshToken, profile, done) {
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