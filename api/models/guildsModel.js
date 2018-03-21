'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var GuildSchema = new Schema({
  name: {
    type: String,
    required: 'Guild should have a name'
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
    required: 'Guild should have a owner'
  },
  image: String,
  site: {
    type: String,
    default: ''
  },
  members: [{
    _id: String,
    role: String
  }],
  tags: [String],
  summary: String,
  description: String,
  usual_locations: [{
    _id: String,
    type: String,
    name: String
  }]
})

GuildSchema.index({ name: 'text' });
module.exports = mongoose.model('Guilds', GuildSchema)
