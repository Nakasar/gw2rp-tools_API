'user strict';

var users = require('./controllers/usersController');
var events = require('./controllers/eventsController');
var locations = require('./controllers/locationsController');
var rumours = require('./controllers/rumoursController');
var characters = require('./controllers/charactersController');

exports.purgeDaily = function() {
  events.purgeEvents();
  locations.purgeLocations();
  rumours.purgeRumours();
}
