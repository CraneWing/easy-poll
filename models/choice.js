var mongoose = require('mongoose');
var uuid = require('node-uuid');

// choice data, when passed to d3.js JS function to
// make pie chart, did not work with default
// hex ObjectID _id and threw errors. JS does NOT
// like hex values, only decimal! Instead,
// model uses this user-defined _id as UUID string,
// as strings don't seem to cause trouble in JS
// and d3.

var choiceSchema = mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4
  },
  choice_name: String,
  choice_count: Number,
  poll_id: String
});

module.exports = mongoose.model('Choice', choiceSchema);

