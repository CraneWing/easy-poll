var mongoose = require('mongoose');

var choiceSchema = mongoose.Schema({
  choice_name: {
    type: String
  },
  choice_count: {
    type: Number
  },
  poll_id: {
    type: String
  }
});

module.exports = mongoose.model('Choice', choiceSchema);

