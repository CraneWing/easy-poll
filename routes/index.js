var express = require('express');
var router = express.Router();

// ======= GET routes ========
// homepage
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome' });
});


module.exports = router;