'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RumourSchema = new Schema({
  name: {
    type: String,
    required: 'Location should have a name'
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
    required: 'Location should have an owner'
  },
  coord: {
    type: String,
    required: 'Location should have coordinates'
  },
  text: {
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
  category: {
    type: String,
    default: 'rumour'
  }
});

module.exports = mongoose.model('Rumours', RumourSchema);
