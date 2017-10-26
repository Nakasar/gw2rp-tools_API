'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
  name: {
    type: String,
    required: 'Location should have a name'
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  icon: {
    type: String,
    required: 'Location should have an icon',
    default: 'divers'
  },
  owner: {
    type: String,
    required: 'Location should have an owner'
  },
  coord: {
    type: String,
    required: 'Location should have coordinates'
  },
  types: {
    type: [String],
    required: 'Location should have one or several types'
  },
  description: {
    type: String,
    required: 'Location should have a description'
  },
  contact: {
    type: String,
    required: 'Location should have a contact info'
  },
  site: {
    type: String,
    default: ''
  },
  hours: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'location'
  }
});

module.exports = mongoose.model('Locations', LocationSchema);
