'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('Users'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs'),
  nodemailer = require('nodemailer'),
  config = require('../../config');

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
    res.json({ success: true, users: users });
  });
};

exports.create_user = function(req, res) {
  // Data Validation
  var username_regex = /^([a-zA-Z0-9]{2,20})$/;
  var password_regex = (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
  var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var gw2_account = req.body.gw2_account + "." + req.body.gw2_id;
  var gw2_account_regex = /^([a-zA-Z]{1,}\.[0-9]{4})$/;
  if (!req.body.nick_name || !username_regex.test(req.body.nick_name)) {
    // Validate username
    res.json({ success: false, message: "User is not correct (alphanumeric characters, maximum length is 20).", code: "REG-06" });
  } else if (!req.body.password || !password_regex.test(req.body.password)) {
    // Validate password
    res.json({ success: false, message: "Password is not correct.", code: "REG-02" });
  } else if (!req.body.email || !email_regex.test(req.body.email)) {
    // Validate email
    res.json({ success: false, message: "Email is not correct.", code: "REG-03" });
  } else if (!gw2_account_regex.test(gw2_account)) {
    // Validate gw2_account
    res.json({ success: false, message: "GW2 Account is not correct (format: Nakasar.5192).", code: "REG-04" });
  } else {
    bcrypt.hash(req.body.password, 8, function(error, hash) {
      if (error) {
        res.json({ success: false, message: "Could not create error (Password error).", code: "REG-05" });
      } else {
        User.findOne({ nick_name: req.body.nick_name}, function(err, user) {
          if (err) {
              res.json({ success: false, message: "Unkown error", code: "REG-00"});
          } else if (user) {
            res.json({ success: false, message: "User already exists.", code: "REG-01"});
          } else {
            var new_user = new User(req.body);
            new_user.password = hash;
            new_user.save(function(err, user) {
              if (err) {
                res.json({ success: false, message: err });
              }

              res.json({ success: true, user: { nick_name: user.nick_name }, message: "Check email for verification." });
            });
          }
        });
      }
    });
  }
};

exports.read_user = function(req, res) {
  // check for id forumactif
  var id_regex = /^([a-z0-9]{1,40})$/;
  if (!id_regex.test(req.params.userId)) {
    res.json({ success: false, message: "Id is not correct", code: "USR-01" });
  } else {
    User.findById(req.params.userId, "_id nick_name gw2_account gw2_id register_date", function(err, user) {
      if (err) {
        res.json({ success: false, message: err });
      }
      if (user) {
        res.json({ success: true, user: user });
      } else {
        res.json({ success: false, message: "No user with such ID.", code: "USR-02" });
      }
    });
  }
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
          res.json({ success: true, user: user });
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
            res.json({ success: false, error: err });
          }
          res.json({ success: true, message: 'User successfully deleted' });
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
            token: token,
            user: {
              nick_name: user.nick_name,
              id: user._id,
              admin: user.admin,
              email: user.email
            }
          });
        } else {
          res.json({ success: false, message: 'Bad credidentials.' });
        }
      });
    }
  });
};

/*
  Checks if a given token is correct for the given user.
  req : id and token
*/
exports.is_logged = function(req, res) {
  var token = req.body.token;

  if (!req.body.id || !token) {
    return res.json({ success: false, message: "Incomplete data (missing id and token).", code: "LOG-001" });
  } else {
    jwt.verify(token, req.app.settings.secretKey, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Invalid token.', code: "LOG-002" });
      } else {
        req.decoded = decoded;
        if (req.decoded.user_id === req.body.id) {
          User.findOne({ _id: req.decoded.user_id }, function(err, user) {
            if (err) {
              res.json({ success: false, message: err });
            }

            if(!user) {
              res.json({ success: false, message: 'User not found.'});
            } else if (user) {
              return res.json({ success: true, message: 'User logged in.', user: { id: user._id, nick_name: user.nick_name, admin: user.admin } });
            }
          });
        } else {
          return res.json({ success: false, message: 'Invalid token.', code: "LOG-002" });
        }
      }
    });
  }
}

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
