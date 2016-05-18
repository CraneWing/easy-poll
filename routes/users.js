var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

// login route
router.get('/login', function(req, res, next) {
  res.render('users/login', {
    title: 'Login',
    currentUser: req.user,
    error: req.flash('error')
  });
});

// login route
router.get('/register', function(req, res, next) {
  res.render('users/register', {
    title: 'Register',
    message: req.flash('message')
  });
});

// log user out
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have been logged out');
  res.redirect('/');
});

// ======= POST routes ========
// log user in with local strategy and form validation
router.post('/login', passport.authenticate('local', {
  successRedirect: '/polls',
  failureRedirect: '/login',
  failureFlash: true 
}), function(req, res, next) {
  req.session.save(function(error) {
    if (error) return next(error);
    
    res.redirect('/polls');
  });
});

// create user account
router.post('/register', function(req, res) {
  var newUser = new User({ username: req.body.username });
  var password = req.body.password;
  var name = req.body.name;

  User.register(newUser, password, function(error, user) {
    if (error) {
      console.log(error);
      return res.render('users/register', {
        error: error.message
      });
    }

    passport.authenticate('local')(req, res, function() {
      req.flash('success', 'Welcome to EasyPoll! Your account is created, and you now can add your own polls, as well as vote on existing ones.');
      res.redirect('/users/login');
    });
  });
}); 

module.exports = router;