// use campground and comments model
var Poll = require('../models/poll');

// object to hold all middleware methods
var middlewareObj = {};

// authorization middleware. campgrounds can be edited or deleted
// only by the user who created them.
middlewareObj.checkPollOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Poll.findById(req.params.id, function(err, poll) {
      if (err) {
        req.flash('error', 'Sorry, poll not found');
        res.redirect('/polls'); 
      }
      else {
        // is user the person who created campground?
        // campground author ID is an object, while req.user.id is a string.
        // Mongoose method ".equals" allows you to compare if they are same.
        if (poll.author.id.equals(req.user._id)) {
          next();
        }
        else {
          req.flash('error', 'Sorry, You do not have permission to work on this poll!');
          res.redirect('/polls'); // send to last page user was on
        }  
      }
    });
  }
  else {
    req.flash('error', 'You must login to perform this action');
    res.redirect('back');
  }
};

module.exports = middlewareObj;