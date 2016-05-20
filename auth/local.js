var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var init = require('./init');

// local registration strategy
	passport.use('local-register', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, username, password, done) {
		// nextTick helps regulate querying DB, which is 
		// asynchronous and should not jump ahead of 
		// authentication.
		process.nextTick(function() {
		  var name = req.body.name;
			// check if a username (user email in this tut)
			// is already in DB.
			User.findOne({'local.username': username}, function(error, user) {
				if (error) return done(error);

				if (user) {
					return done(null, false, req.flash(
						'error', 'Sorry, that username is already taken')
					);
				}
				else { 
					// the ol' instantiation of a new User instance
					var newUser = new User();
					// set user's display name
					newUser.local.displayName = name;
					// set user email in model
					newUser.local.username = username;
					// password hasher thru bcrypt is called from
					// user model.
					newUser.local.password = newUser.generateHash(password);
					// save is a native MongoDB method
					newUser.save(function(error) {
						if (error) throw error;
						return done(null, newUser, req.flash('success', 'You have been successfully registered. Now you not only can vote in polls but add your own!'));
					});
				}
			});
		});
	}));

	// local login strategy
	passport.use('local-login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, username, password, done) {
			// check if user already in DB.
			User.findOne({'local.username': username}, function(error, user) {
				if (error) return done(error);
				// if no username found, not in the DB!
				if (!user) {
					return done(null, false, req.flash(
						'error', 'Sorry, username was not found!')
					);
				}
				// if incorrect password entered, sent to password
				// checker in User model.
				if (!user.validPassword(password)) {
					return done(null, false, req.flash(
						'error', 'Invalid password')
					);
				}
				// if user in DB and has valid password, return user
				return done(null, user, req.flash('success', 'Welcome! You are now logged in'));
			});
	}));
	
	init();
	
	module.exports = passport;

