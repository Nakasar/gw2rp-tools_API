'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CharacterSchema = new Schema({
  name: {
    type: String,
    required: 'A character should have a name.'
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  last_update: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: String,
    required: 'Event should have an owner'
  },
  description: {
    type: String
  },
  appearance: {
    type: String
  },
  image_url: {
    type: String
  },
  status: {
    type: String,
    enum: ["npc", "dead", "played"]
  },
  caracteristics: [{
    name: {
      type: String,
      required: 'A characteristic should have a name.'
    },
    value: {
      type: Number,
      required: 'A characteristic should have a value.'
    },
    remark: {
      type: String
    }
  }],
  skills: [{
    name: {
      type: String,
      required: 'A skill should have a name.'
    },
    value: {
      type: Number,
      required: 'A skill should have a value.'
    },
    remark: {
      type: String
    }
  }]
});

module.exports = mongoose.model('Characters', CharacterSchema);
