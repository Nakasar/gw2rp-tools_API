var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Event = require('./api/models/eventsModel'),
  Location = require('./api/models/locationsModel'),
  Rumours = require('./api/models/rumoursModel')
  Characters = require('./api/models/charactersModel'),
  User = require('./api/models/usersModel'),
  apiFunctions = require('./api/functions.js'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  jwt = require('jsonwebtoken'),
  cors = require('cors'),
  schedule = require('node-schedule');

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
app.set('secretKey', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

var apiRoutes = express.Router();
var routes = require('./api/routes/routes');
routes(apiRoutes);

app.use('/api', apiRoutes)

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

// Shedule API purge.
var purge = schedule.scheduleJob({ hour: 06, minute: 00 }, function() {
  apiFunctions.purgeDaily();
});

app.listen(port);

console.log('GW2RP RESTful API server started on: ' + port);
