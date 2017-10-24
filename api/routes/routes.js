'use strict';
module.exports = function(router) {
  var users = require('../controllers/usersController');
  var events = require('../controllers/eventsController');
  var locations = require('../controllers/locationsController');

  router.route('/setup').post(users.create_admin);

  // Accessible without authentification
  router.route('/login').post(users.login_user);
  router.route('/signup').post(users.create_user);
  router.route('/events').get(events.list_all_events);
  router.route('/events/:eventId').get(events.read_event);
  router.route('/locations').get(locations.list_all_locations);
  router.route('/locations/:locationId').get(locations.read_location)

  // middleware checking for auth.
  router.use(users.check_token);

  // Users Routes
  router.route('/users').get(users.list_all_users).post(users.create_user);
  router.route('/users/:userId').get(users.read_user).put(users.update_user).delete(users.delete_user);

  // Events Routes
  router.route('/events').post(events.create_event);
  router.route('/events/:eventId').put(events.update_event).delete(events.delete_event);

  // Locations Routes
  router.route('/locations').post(locations.create_location);
  router.route('/locations/:locationId').put(locations.update_location).delete(locations.delete_location);

  router.use(users.check_admin);

  router.route('/users').delete(users.delete_all);
  router.route('/locations').delete(locations.delete_all);
  router.route('/events').delete(events.delete_all);
}
