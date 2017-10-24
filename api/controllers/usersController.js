'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('Users'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs');

exports.create_admin = function(req, res) {
  var nakasar = new User({
    nick_name: 'Nakasar',
    password: 'password',
    admin: true,
    gw2_account: 'Nakasar',
    gw2_id: 5192,
    email: 'nakasar@outlook.fr'
  })

  bcrypt.hash('password', 8, function(err, hash) {
    nakasar.password = hash;

    nakasar.save(function(err)   {
      if(err) {
        res.json(err);
      }
      res.json({ success: true });
    })
  });
}

exports.list_all_users = function(req, res) {
  User.find({}, "_id nick_name gw2_account gw2_id register_date", function(err, users) {
    if (err) {
      res.send(err);
    }
    res.json(users);
  });
};

exports.create_user = function(req, res) {
  bcrypt.hash(req.body.password, 8, function(error, hash) {
    if (error) {
      res.json({ success: false, message: "Could not create error (Password error)." });
    } else {
      var new_user = new User(req.body);
      new_user.password = hash;
      new_user.save(function(err, user) {
        if (err) {
          res.send(err);
        }
        res.json(user);
      });
    }
  });
};

exports.read_user = function(req, res) {
  User.findById(req.params.userId, "_id nick_name gw2_account gw2_id register_date", function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json(user);
  });
};

exports.update_user = function(req, res) {
  User.findById(req.params.userId, function(err, user) {
    if (err) {
      res.send(err);
    } else {
      if (user._id.equals(req.decoded.user_id) || req.decoded.admin) {
        User.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}, function(err, user) {
          if (err) {
            res.send(err);
          };
          res.json(user);
        });
      } else {
        res.json({ success: false, message: 'You can not update someone else account.'});
      }
    }
  });
};

exports.delete_user = function(req, res) {
  User.findById(req.params.userId, function(err, user) {
    if (err) {
      res.send(err);
    } else {
      console.error(user._id + " " + req.decoded.user_id);
      if (user._id.equals(req.decoded.user_id) || req.decoded.admin) {
        User.remove({
          _id: req.params.userId
        }, function(err, user) {
          if (err) {
            res.send(err);
          }
          res.json({ message: 'User successfully deleted' });
        });
      } else {
        res.json({ success: false, message: 'You can not delete someone else account.'})
      }
    }
  });
};

exports.login_user = function(req, res) {
  User.findOne({ nick_name: req.body.nick_name }, function(err, user) {
    if (err) {
      res.send(err);
    }

    if(!user) {
      res.json({ success: false, message: 'User not found.'});
    } else if (user) {
      // check password
      bcrypt.compare(req.body.password, user.password, function(error, result) {
        if (error) {
          res.json({ success: false, message: 'Auth error.' });
        } else if (result) {
          //create token
          const payload = { admin: user.admin, user_id: user._id };
          var token = jwt.sign(payload, req.app.settings.secretKey, {
            expiresIn: 86400 // 24 hours
          });

          res.json({
            success: true,
            message: 'User logged in',
            token: token
          });
        } else {
          res.json({ success: false, message: 'Bad credidentials.' });
        }
      });
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

exports.check_admin = function(req, res, next) {
  if (req.decoded.admin) {
    next();
  } else {
    return res.status(403).send({
      success: false,
      message: 'Access denied.'
    });
  }
};

exports.delete_all = function(req, res) {
  User.remove({}, function(err) {
    if (err) {
      res.json({ success: false, message: "Error while trying to whipe the user database."});
    } else {
      res.json({ success: true, message: "User database whiped."});
    }
  });
};
