'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  nick_name: {
    type: String,
    required: 'User should have a nickname.'
  },
  register_date: {
    type: Date,
    default: Date.now
  },
  gw2_account: {
    type: String
  },
  gw2_id: {
    type: Number
  },
  email: {
    type: String,
    required: "User should have a valid email."
  },
  password: {
    type: String,
    required: "User should have a valid password."
  },
  admin: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Users', UserSchema);
