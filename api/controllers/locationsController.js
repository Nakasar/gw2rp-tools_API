'use strict';

var mongoose = require('mongoose'), Location = mongoose.model('Locations');

const string_regex = /^([a-z]{1,})$/;

exports.list_all_locations = function(req, res) {
  if (req.query.types) {
    if (Array.isArray(req.query.types)) {
      Location.find({ types : { $all: req.query.types } }).exec(function(err, locations) {
        if (err) {
          return res.json({ success: false, message: err });
        } else {
          res.statusCode = 200;
          return res.json({ success: true, locations: locations });
        }
      });
    } else {
      return res.json({ success: false, message: "types[] should be an array of strings." + req.query.types });
    }
  } else {
    Location.find({}, function(err, locations) {
      if (err) {
        return res.json({ success: false, message: err });
      }
      return res.json({ success: true, locations: locations });
    });
  }
};

exports.refresh_location = function(req, res) {
  if (req.params.locationId) {
    Location.findByIdAndUpdate(req.params.locationId, { last_update: Date.now() }, function(location, err) {
      if (err) {
        return res.json({ success: false, message: err });
      } else if (location) {
        return res.json({ success: true, message: "Location will remain for three month.", location: location });
      } else {
        return res.json({ success: false, message: "No location found for this id." });
      }
    });
  } else {
    return res.json({ success: false, message: "No location specified" });
  }
};

exports.create_location = function(req, res) {
  var new_location = new Location(req.body);
  new_location.owner = req.decoded.user_id;
  new_location.save(function(err, location) {
    if (err) {
      return res.json({ success: false, message: err });
    } else {
      return res.json({ success: true, location: location });
    }
  });
};

exports.read_location = function(req, res) {
  Location.findById(req.params.locationId, function(err, location) {
    if (err) {
      return res.json({ success: false, message: err });
    }
    return res.json({ success: true, location: location });
  });
};

exports.update_location = function(req, res) {
  Location.findById(req.params.locationId, function(err, location) {
    if (err) {
      res.json({ success: false, message: err });
    } else if (location) {
      if (location.owner === req.decoded.user_id || req.decoded.admin) {
        req.body.last_update = new Date();
        Location.findOneAndUpdate({_id: req.params.locationId}, req.body, {new: true}, function(err, location) {
          if (err) {
            return res.json({ success: false, message: err });
          };
          return res.json({ success: true, location: location });;
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this location.'})
      }
    } else {
      return res.json({ success: false, message: 'No location for this id.'});
    }
  });
};

exports.delete_location = function(req, res) {
  Location.findById(req.params.locationId, function(err, location) {
    if (err) {
      return res.send(err);
    } else if (location) {
      if (location.owner === req.decoded.user_id || req.decoded.admin) {
        Location.remove({
          _id: req.params.locationId
        }, function(err, location) {
          if (err) {
            return res.json({ success: false, message: err });
          }
          return res.json({ success: true, message: 'Location successfully deleted' });
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this location.'})
      }
    } else {
      return res.json({ success: false, message: 'No location with this ID.'})
    }
  });
};

exports.purgeLocations = function() {
  var date = new Date((new Date).getTime() - 3*30*24*60*60*1000); // Three month
  Location.remove({ last_update: { $lte: date } }, function(err) {

  });
}

exports.delete_all = function(req, res) {
  Location.remove({}, function(err) {
    if (err) {
      return res.json({ success: false, message: "Error while trying to whipe the location database."});
    } else {
      return res.json({ success: true, message: "Location database whiped."});
    }
  });
};
