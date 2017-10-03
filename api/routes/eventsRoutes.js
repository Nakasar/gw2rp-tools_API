'use strict',
module.exports = function(app) {
  var events = require('../controllers/eventsController');

  // Events Routes
  app.route('/events').get(events.list_all_events).post(events.create_event);
  app.route('/events/:eventId').get(events.read_event).put(events.update_event).delete(events.delete_event);
}
