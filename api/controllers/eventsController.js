'use strict';

var mongoose = require('mongoose'), Event = mongoose.model('Events');

const digit_regex = /^([0-9]{1,2})$/;
const string_regex = /^([a-z]{1,})$/;

exports.list_all_events = function(req, res) {
  // Check for request params, and act depending on.
  if (req.query.types) {
    var query = [];
    req.query.types.forEach(function (type) {
      if (string_regex.test(type)) {
        query.push({ types: type });
      }
    });
    Event.find({ $or : query }).exec(function(err, events) {
      if (err) {
        return res.json({ success: false, message: err });
      } else {
        res.statusCode = 200;
        return res.json({ success: true, events: events });
      }
    });
  } else if (req.query.next) {
    if (digit_regex.test(req.query.next)) {
      Event.find({ end_date : { $gt: Date.now() } }).limit(parseInt(req.query.next)).sort({ end_date: 1 }).exec(function(err, events) {
        if (err) {
          return res.json({ success: false, message: err });
        }
        res.statusCode = 200;
        return res.json({ success: true, events: events });
      });
    } else {
      return res.json({ success: false, message: "next should be a number." });
    }
  } else {
    Event.find({}, function(err, event) {
      if (err) {
        return res.json({ success: false, message: err });
      }
      res.statusCode = 200;
      return res.json({ success: true, events: event });
    });
  }
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
