'use strict';
module.exports = function(router) {
  var users = require('../controllers/usersController');
  var events = require('../controllers/eventsController');
  var locations = require('../controllers/locationsController');
  var rumours = require('../controllers/rumoursController');
  var characters = require('../controllers/charactersController');
  var guilds = require('../controllers/guildsController');

  //router.route('/setup').post(users.create_admin);

  // Accessible without authentification
  router.route('/login').post(users.login_user);
  router.route('/signup').post(users.create_user);
  router.route('/validate').post(users.ask_validation);
  router.route('/validate/:userId/:token').get(users.validate_email);
  router.route('/me').post(users.is_logged);
  router.route('/events').get(events.list_all_events);
  router.route('/events/:eventId').get(events.read_event);
  router.route('/events/:eventId/participants').get(events.get_participants);
  router.route('/locations').get(locations.list_all_locations);
  router.route('/locations/:locationId').get(locations.read_location);
  router.route('/rumours').get(rumours.list_all_rumours);
  router.route('/rumours/:rumourId').get(rumours.read_rumour);
  router.route('/characters').get(characters.list_all_characters);
  router.route('/characters/search').get(characters.search_characters);
  router.route('/characters/:characterId/stats').get(characters.get_stats);
  router.route('/characters/:characterId').get(characters.read_character);
  router.route('/users/:userId/characters').get(characters.list_all_characters_for_user);
  router.route('/users/:userId/creations').get(users.get_creations);
  router.route('/guilds').get(guilds.get_all_guilds);
  router.route('/guilds/search').get(guilds.search_guilds);
  router.route('/guilds/:guildId').get(guilds.get_guild);

  // middleware checking for auth.
  router.use(users.check_token);

  // Users Routes
  router.route('/users').get(users.list_all_users).post(users.create_user);
  router.route('/users/:userId').get(users.read_user).put(users.update_user).delete(users.delete_user);

  // Events Routes
  router.route('/events').post(events.create_event);
  router.route('/events/:eventId').put(events.update_event).delete(events.delete_event);
  router.route('/events/:eventId/participate').post(events.participate);

  // Locations Routes
  router.route('/locations').post(locations.create_location);
  router.route('/locations/:locationId').put(locations.update_location).delete(locations.delete_location);
  router.route('/locations/:locationId/refresh').post(locations.refresh_location);

  // Rumours Routes
  router.route('/rumours').post(rumours.create_rumour);
  router.route('/rumours/:rumourId').put(rumours.update_rumour).delete(rumours.delete_rumour);
  router.route('/rumours/:rumourId/refresh').post(rumours.refresh_rumour);

  // Characters Routes
  router.route('/characters').post(characters.create_character);
  router.route('/characters/:characterId/caracs').put(characters.update_caracteristics).delete(characters.delete_caracteristics);
  router.route('/characters/:characterId/skills').put(characters.update_skills).delete(characters.delete_skills);
  router.route('/characters/:characterId').put(characters.update_character).delete(characters.delete_character);

  router.route('/guilds').post(guilds.create_guild);
  router.route('/guilds/:guildId').put(guilds.update_guild).delete(guilds.delete_guild);

  router.use(users.check_admin);

  router.route('/users').delete(users.delete_all);
  router.route('/users/:userId/password').post(users.set_password);
  router.route('/users/:userId/status').post(users.set_status);
  router.route('/locations').delete(locations.delete_all);
  router.route('/events').delete(events.delete_all);
  router.route('/rumours').delete(rumours.delete_all);
  router.route('/characters').delete(characters.delete_all);
  router.route('/guilds').delete(guilds.delete_all_guilds);
}
