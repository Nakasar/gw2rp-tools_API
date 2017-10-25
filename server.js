var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Event = require('./api/models/eventsModel'),
  Location = require('./api/models/locationsModel'),
  User = require('./api/models/usersModel'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  jwt = require('jsonwebtoken');

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
app.set('secretKey', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods',  "GET, POST, OPTIONS, PUT, DELETE");

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

var apiRoutes = express.Router();
var routes = require('./api/routes/routes');
routes(apiRoutes);

app.use('/api', apiRoutes)

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);

console.log('GW2RP RESTful API server started on: ' + port);
