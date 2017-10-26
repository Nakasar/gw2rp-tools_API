'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
  name: {
    type: String,
    required: 'Event should have a name'
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  icon: {
    type: String,
    required: 'Event should have an icon',
    default: 'générique'
  },
  owner: {
    type: String,
    required: 'Event should have an owner'
  },
  coord: {
    type: String,
    required: 'Event should have coordinates'
  },
  types: {
    type: [String],
    required: 'Event should have one or several types'
  },
  description: {
    type: String,
    required: 'Event should have a description'
  },
  contact: {
    type: String,
    required: 'Event should have a contact info'
  },
  site: {
    type: String,
    default: ''
  },
  end_date: {
    type: Date,
  },
  category: {
    type: String,
    default: 'event'
  },
  difficulty: {
    type: String,
    enum: ['peaceful', 'easy', 'normal', 'difficult', 'hardcore'],
    default: 'normal',
    required: true
  }
});

module.exports = mongoose.model('Events', EventSchema);
