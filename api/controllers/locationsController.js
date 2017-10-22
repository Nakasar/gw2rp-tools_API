'use strict';

var mongoose = require('mongoose'), Location = mongoose.model('Locations');

exports.list_all_locations = function(req, res) {
  Location.find({}, function(err, location) {
    if (err) {
      res.send(err);
    }
    res.json(location);
  });
};

exports.create_location = function(req, res) {
  var new_location = new Location(req.body);
  new_location.save(function(err, location) {
    if (err) {
      res.send(err);
    }
    res.json(location);
  });
};

exports.read_location = function(req, res) {
  Location.findById(req.params.locationId, function(err, location) {
    if (err) {
      res.send(err);
    }
    res.json(location);
  });
};

exports.update_location = function(req, res) {
  Location.findOneAndUpdate({_id: req.params.locationId}, req.body, {new: true}, function(err, location) {
    if (err) {
      res.send(err);
    };
    res.json(location);
  });
};

exports.delete_location = function(req, res) {
  Location.remove({
    _id: req.params.locationId
  }, function(err, location) {
    if (err) {
      res.send(err);
    }
    res.json({ message: 'Location successfully deleted' });
  });
};
