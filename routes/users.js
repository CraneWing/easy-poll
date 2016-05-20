var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportLocal = require('../auth/local');
var passportTwitter = require('../auth/twitter');
var User = require('../models/user');

// ======= GET routes ========
// login route
router.get('/login', function(req, res, next) {
  res.render('users/login', {
    title: 'Login',
    currentUser: req.user,
    error: req.flash('error')
  });
});

// register route for non-social accounts
router.get('/register', function(req, res, next) {
  res.render('users/register', {
    title: 'Register',
    message: req.flash('message')
  });
});

// register through Twitter
router.get('/auth/twitter', passportTwitter.authenticate('twitter'));

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/polls',
    failureRedirect: '/login'
  }));
  
// log user out
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have been logged out');
  res.redirect('/');
});

// ======= POST routes ========
// log user in with local strategy 
router.post('/login', passportLocal.authenticate('local-login', {
  successRedirect: '/polls',
  failureRedirect: '/users/login',
  failureFlash: true 
}), function(req, res, next) {
  req.session.save(function(error) {
    if (error) return next(error);
    
    res.redirect('/polls');
  });
});

// registration form processing with passport
// authentication and redirect
router.post('/register', passportLocal.authenticate('local-register', {
	successRedirect: '/polls',
	failureRedirect: '/register',
	failureFlash: true
}));

module.exports = router;