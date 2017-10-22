'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('Users'),
  jwt = require('jsonwebtoken');

exports.list_all_users = function(req, res) {
  User.find({}, function(err, users) {
    if (err) {
      res.send(err);
    }
    res.json(users);
  });
};

exports.create_user = function(req, res) {
  var new_user = new User(req.body);
  new_user.save(function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json(user);
  });
};

exports.read_user = function(req, res) {
  User.findById(req.params.userId, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json(user);
  });
};

exports.update_user = function(req, res) {
  User.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json(user);
  });
};

exports.delete_user = function(req, res) {
  User.remove({
    _id: req.params.userId
  }, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json({ message: 'User successfully deleted' });
  });
};

exports.login_user = function(req, res) {
  User.findOne({nick_name: req.body.nick_name}, function(err, user) {
    if (err) {
      res.send(err);
    }

    if(!user) {
      res.json({ success: false, message: 'User not found.'});
    } else if (user) {
      // check password
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Bad credidentials.' });
      } else {
        //create token
        const payload = { admin: user.admin };
        var token = jwt.sign(payload, req.app.settings.secretKey, {
          expiresIn: 86400 // 24 hours
        });

        res.json({
          success: true,
          message: 'User logged in',
          token: token
        });
      }
    }
  });
};

exports.check_token = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, req.app.settings.secretKey, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'authentification failed.' });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'Invalid authentification.'
    });
  }
};
