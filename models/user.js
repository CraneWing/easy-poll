// campground model module
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// schema for campgrounds. adds reference to associated
// comments for particular campground
var userSchema = new mongoose.Schema({
	name: {
  	type: String
  },
  username: {
  	type: String
  },
  password: {
  	type: String
  },
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