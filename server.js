var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Event = require('./api/models/eventsModel'),
  bodyParser = require('body-parser');

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://Abaddon:VNCm1Qo7PAzjPo57@gw2tools-shard-00-00-ozshx.mongodb.net:27017,gw2tools-shard-00-01-ozshx.mongodb.net:27017,gw2tools-shard-00-02-ozshx.mongodb.net:27017/test?ssl=true&replicaSet=GW2Tools-shard-0&authSource=admin');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

var routes = require('./api/routes/eventsRoutes');
routes(app);

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);
