var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  local: {
    displayName: String,
    username: String,
    password: String
  },
  twitter: {
    id: String,
    displayName: String,
    username: String,
    token: String
  }
});

// password hasher
userSchema.methods.generateHash = function generateHash(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// compare passwords in local login
userSchema.methods.validPassword = function validPassword(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// create user model
module.exports = mongoose.model('User', userSchema);