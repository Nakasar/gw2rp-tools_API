'use strict';

var mongoose = require('mongoose'), Event = mongoose.model('Events');

const digit_regex = /^([0-9]{1,2})$/;
const string_regex = /^([a-z]{1,})$/;

exports.list_all_events = function(req, res) {
  // Check for request params, and act depending on.
  if (req.query.types) {
    if (Array.isArray(req.query.types)) {

      Event.find({ types : { $all: req.query.types } }).exec(function(err, events) {
        if (err) {
          return res.json({ success: false, message: err });
        } else {
          res.statusCode = 200;
          return res.json({ success: true, events: events });
        }
      });
    } else {
      return res.json({ success: false, message: "types[] should be an array of strings." + req.query.types });
    }
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

exports.purgeEvents = function() {
  // Event done.
  var date = new Date((new Date).getTime() - 8*60*60*1000); // 8 hours
  Event.remove({ end_date: { $lte: date } }, function(err) {

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

exports.participate = function(req, res) {
  if (!["no", "cannot", "maybe", "yes"].includes(req.body.status)) {
    return res.json({ success: false, message: "status must be no, cannot, maybe or yes." })
  }
  Event.findById(req.params.eventId, function(err, event) {
    if (err) {
      return res.json({ success: false, message: err })
    } else if (event) {
      var participation = {
        user: req.decoded.user_id,
        status: req.body.status,
        date: new Date()
      }
      // Search for current user in participation list
      for (var participant of event.participants) {
        if (participant.user === req.decoded.user_id) {
          event.participants.splice(event.participants.indexOf(participant), 1)
          break
        }
      }
      event.participants.push(participation)
      event.save(function(err, new_event) {
        if (err) {
          return res.json({ success: false, message: err })
        }
        return res.json({ success: true, message: "Participation updated for user.", event: new_event })
      })
    } else {
      return res.json({ success: false, message: "No event with such id." })
    }
  })
}
