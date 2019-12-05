var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var userschema = new mongoose.Schema({
  email: String,
  username: String,
  password: String
});
userschema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", userschema);
