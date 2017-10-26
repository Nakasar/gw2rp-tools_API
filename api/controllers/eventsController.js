'use strict';

var mongoose = require('mongoose'), Event = mongoose.model('Events');

exports.list_all_events = function(req, res) {
  Event.find({}, function(err, event) {
    if (err) {
      return res.json({ success: false, message: err });
    }
    return res.json({ success: true, events: event });
  });
};

exports.create_event = function(req, res) {
  var new_event = new Event(req.body);
  new_event.owner = req.decoded.user_id;
  new_event.save(function(err, event) {
    if (err) {
      return res.json({ success: false, message: err });
    }
    return res.json({ success: true, event: event });
  });
};

exports.read_event = function(req, res) {
  Event.findById(req.params.eventId, function(err, event) {
    if (err) {
      return res.json({ success: false, message: err });
    }
    return res.json({ success: true, event: event });
  });
};

exports.update_event = function(req, res) {
  Event.findById(req.params.eventId, function(err, event) {
    if (err) {
      return res.send(err);
    } else if (event) {
      if (event.owner === req.decoded.user_id || req.decoded.admin) {
        Event.findOneAndUpdate({_id: req.params.eventId}, req.body, {new: true}, function(err, event) {
          if (err) {
            return res.json({ success: false, message: err });
          };
          return res.json({ success: true, event: event });
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this event.'})
      }
    } else {
      return res.json({ success: false, message: 'No event for this id.'});
    }
  });
};

exports.delete_event = function(req, res) {
  Event.findById(req.params.eventId, function(err, event) {
    if (err) {
      return res.send(err);
    } else {
      if (event.owner === req.decoded.user_id || req.decoded.admin) {
        Event.remove({
          _id: req.params.eventId
        }, function(err, event) {
          if (err) {
            return res.json({ success: false, message: err });
          }
          return res.json({ success: true, message: 'Event successfully deleted' });
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this event.'})
      }
    }
  });
};

exports.delete_all = function(req, res) {
  Event.remove({}, function(err) {
    if (err) {
      return res.json({ success: false, message: "Error while trying to whipe the event database."});
    } else {
      return res.json({ success: true, message: "Event database whiped."});
    }
  });
};
