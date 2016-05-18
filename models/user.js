var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	name: String,
  username: String,
  password: String,
  someID: String,
  created_at: {
  	type: Date,
  	default: Date.now()
  }
});

// connect model to Passport Local Mongoose module. adds
// built-in data related to session decoding and encoding.
userSchema.plugin(passportLocalMongoose);

// create user model
module.exports = mongoose.model('User', userSchema);