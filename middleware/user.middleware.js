// object to hold all middleware methods
var middlewareObj = {};

// middleware for checking if person is logged in.
middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // Express has built-in understanding of "next"
  }
  // since returning in the if statement, no else is used here.
  // this redirects user to login page. flash message sent and will
  // appear on redirect page.
  req.flash('error', 'You must login to perform this action');
  res.redirect('/users/login'); 
};

module.exports = middlewareObj;