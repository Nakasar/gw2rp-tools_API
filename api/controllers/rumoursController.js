'use strict';

var mongoose = require('mongoose'), Rumour = mongoose.model('Rumours');

const digit_regex = /^([0-9]{1,2})$/;

exports.list_all_rumours = function(req, res) {
  if (req.query.latest) {
    if (digit_regex.test(req.query.latest)) {
      Rumour.find({ }).limit(parseInt(req.query.latest)).sort({ created_date: -1 }).exec(function(err, rumours) {
        if (err) {
          return res.json({ success: false, message: err });
        }
        res.statusCode = 200;
        return res.json({ success: true, rumours: rumours });
      });
    }
  } else {
    Rumour.find({}, function(err, rumour) {
      if (err) {
        return res.json({ success: false, message: err });
      }
      return res.json({ success: true, rumours: rumour });
    });
  }
};

exports.create_rumour = function(req, res) {
  var new_rumour = new Rumour(req.body);
  new_rumour.owner = req.decoded.user_id;
  new_rumour.save(function(err, rumour) {
    if (err) {
      return res.json({ success: false, message: err });
    } else {
      return res.json({ success: true, rumour: rumour });
    }
  });
};

exports.read_rumour = function(req, res) {
  Rumour.findById(req.params.rumourId, function(err, rumour) {
    if (err) {
      return res.json({ success: false, message: err });
    }
    return res.json({ success: true, rumour: rumour });
  });
};

exports.update_rumour = function(req, res) {
  Rumour.findById(req.params.rumourId, function(err, rumour) {
    if (err) {
      res.json({ success: false, message: err });
    } else if (rumour) {
      if (rumour.owner === req.decoded.user_id || req.decoded.admin) {
        Rumour.findOneAndUpdate({_id: req.params.rumourId}, req.body, {new: true}, function(err, rumour) {
          if (err) {
            return res.json({ success: false, message: err });
          };
          return res.json({ success: true, rumour: rumour });;
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this rumour.'})
      }
    } else {
      return res.json({ success: false, message: 'No rumour for this id.'});
    }
  });
};

exports.delete_rumour = function(req, res) {
  Rumour.findById(req.params.rumourId, function(err, rumour) {
    if (err) {
      return res.send(err);
    } else {
      if (rumour.owner === req.decoded.user_id || req.decoded.admin) {
        Rumour.remove({
          _id: req.params.rumourId
        }, function(err, rumour) {
          if (err) {
            return res.json({ success: false, message: err });
          }
          return res.json({ success: true, message: 'Rumour successfully deleted' });
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this rumour.'})
      }
    }
  });
};

exports.delete_all = function(req, res) {
  Rumour.remove({}, function(err) {
    if (err) {
      return res.json({ success: false, message: "Error while trying to whipe the rumour database."});
    } else {
      return res.json({ success: true, message: "Rumour database whiped."});
    }
  });
};
