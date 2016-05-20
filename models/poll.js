var mongoose = require('mongoose');

var pollSchema = mongoose.Schema({
  poll_title: String,
  question: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  total_votes: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  users_voted: [{
    type: String
  }]
});

module.exports = mongoose.model('Poll', pollSchema);

