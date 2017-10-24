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
  new_location.owner = req.decoded.user_id;
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
  Location.findById(req.params.eventId, function(err, location) {
    if (err) {
      res.send(err);
    } else {
      if (location.owner.equals(req.decoded.user_id) || req.decoded.admin) {
        Location.findOneAndUpdate({_id: req.params.locationId}, req.body, {new: true}, function(err, location) {
          if (err) {
            res.send(err);
          };
          res.json(location);
        });
      } else {
        res.json({ success: false, message: 'You are not the owner of this location.'})
      }
    }
  });

  Location.findOneAndUpdate({_id: req.params.locationId}, req.body, {new: true}, function(err, location) {
    if (err) {
      res.send(err);
    };
    res.json(location);
  });
};

exports.delete_location = function(req, res) {
  Location.findById(req.params.locationId, function(err, location) {
    if (err) {
      res.send(err);
    } else {
      if (location.owner.equals(req.decoded.user_id) || req.decoded.admin) {
        Location.remove({
          _id: req.params.locationId
        }, function(err, location) {
          if (err) {
            res.send(err);
          }
          res.json({ message: 'Location successfully deleted' });
        });
      } else {
        res.json({ success: false, message: 'You are not the owner of this location.'})
      }
    }
  });
};

exports.delete_all = function(req, res) {
  Location.remove({}, function(err) {
    if (err) {
      res.json({ success: false, message: "Error while trying to whipe the location database."});
    } else {
      res.json({ success: true, message: "Location database whiped."});
    }
  });
};
