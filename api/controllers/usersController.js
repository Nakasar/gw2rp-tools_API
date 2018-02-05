'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('Users'),
  Event = mongoose.model('Events'),
  Location = mongoose.model('Locations'),
  Rumor = mongoose.model('Rumours'),
  Character = mongoose.model('Characters'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs'),
  nodemailer = require('nodemailer'),
  crypto = require('crypto'),
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
        return res.json(err);
      }
      return res.json({ success: true });
    })
  });
}

exports.list_all_users = function(req, res) {
  User.find({}, "_id nick_name gw2_account gw2_id register_date active", function(err, users) {
    if (err) {
      return res.send(err);
    }
    return res.json({ success: true, users: users });
  });
};

exports.create_user = function(req, res) {
  // Data Validation
  var username_regex = /^([a-zA-Z0-9 ]{2,20})$/;
  var password_regex = (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
  var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var gw2_account = req.body.gw2_account + "." + req.body.gw2_id;
  var gw2_account_regex = /^([a-zA-Z]{1,}\.[0-9]{4})$/;
  if (!req.body.nick_name || !username_regex.test(req.body.nick_name)) {
    // Validate username
    return res.json({ success: false, message: "User is not correct (alphanumeric characters, maximum length is 20).", code: "REG-06" });
  } else if (!req.body.password || !password_regex.test(req.body.password)) {
    // Validate password
    return res.json({ success: false, message: "Password is not correct.", code: "REG-02" });
  } else if (!req.body.email || !email_regex.test(req.body.email)) {
    // Validate email
    return res.json({ success: false, message: "Email is not correct.", code: "REG-03" });
  } else if (!gw2_account_regex.test(gw2_account)) {
    // Validate gw2_account
    return res.json({ success: false, message: "GW2 Account is not correct (format: Nakasar.5192).", code: "REG-04" });
  } else {
    bcrypt.hash(req.body.password, 8, function(error, hash) {
      if (error) {
        return res.json({ success: false, message: "Could not create error (Password error).", code: "REG-05" });
      } else {
        User.findOne({ nick_name: req.body.nick_name}, function(err, user) {
          if (err) {
              return res.json({ success: false, message: "Unkown error", code: "REG-00"});
          } else if (user) {
            return res.json({ success: false, message: "User already exists.", code: "REG-01"});
          } else {
            var new_user = new User(req.body);
            new_user.password = hash;
            new_user.validation_token = crypto.randomBytes(64).toString('hex');
            new_user.save(function(err, user) {
              if (err) {
                return res.json({ success: false, message: err });
              }

              var validationLink = "https://gw2rp-tools.ovh/api/validate/" + user._id + "/" + user.validation_token;

              var transporter = nodemailer.createTransport({
                host: config.mail.host,
                port: config.mail.port,
                secure: config.mail.secure,
                auth: {
                  user: config.mail.user,
                  pass: config.mail.pass
                }
              });

              let mailOptions = {
                from: '"Abaddon, la Voix des Brumes" <noreply@gw2rp-tools.ovh>',
                to: user.email,
                subject: 'Confirmation de compte GW2RP-Tools',
                text: 'Bienvenue sur la boîte à outils GW2RP-Tools ! Merci de confirmer votre adresse email en cliquant sur le lien suivant pour activer votre compte : ' ,
                html: '<p>Bienvenue sur la boîte à outils GW2RP-Tools !</p><p>Merci de confirmer votre adresse email en cliquant sur le lien suivant pour activer votre compte :<br/><a href="' + validationLink + '">' + validationLink + '</a></p>'
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error)
                }
                console.log('Message sent: %s', info.messageId);
              });

              return res.json({ success: true, user: { nick_name: user.nick_name }, message: "Check your email for verification." });
            });
          }
        });
      }
    });
  }
};

exports.validate_email = function(req, res) {
  if (req.params.userId.length > 0 && req.params.token.length > 0) {
    User.findById(req.params.userId, function(err, user) {
      if (err) {
        return res.json({ success: false, message: "Invalid token or/and user." });
      } else if (user) {
        if (user.validation_token === req.params.token) {
          user.active = true;
          user.validation_token = "";
          user.save(function(err, us) {
            if (err) {
              return res.json({ success: false, message: "Invalid token." });
            } else {
              return res.json({ success: true, message: "User account is now active." });
            }
          });
        } else {
          return res.json({ success: false, message: "Invalid token." });
        }
      } else {
        return res.json({ success: false, message: "Invalid token or/and user." });
      }
    });
  } else {
    return res.json({ success: false, message: "Invalid token or/and user." });
  }
};

exports.read_user = function(req, res) {
  // check for id forumactif
  var id_regex = /^([a-z0-9]{1,40})$/;
  if (!id_regex.test(req.params.userId)) {
    return res.json({ success: false, message: "Id is not correct", code: "USR-01" });
  } else {
    User.findById(req.params.userId, "_id nick_name gw2_account gw2_id register_date active", function(err, user) {
      if (err) {
        return res.json({ success: false, message: err });
      }
      if (user) {
        return res.json({ success: true, user: user });
      } else {
        return res.json({ success: false, message: "No user with such ID.", code: "USR-02" });
      }
    });
  }
};

exports.set_password = function(req, res) {
  var password_regex = (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
  if (!req.body.password || !password_regex.test(req.body.password)) {
    // Validate password
    return res.json({ success: false, message: "Password is not correct.", code: "UPDU-05" });
  } else {
    User.findOne({ _id: req.params.userId}, function(err, user) {
      if (err) {
        return res.json({ success: false, message: "Unkown error", code: "UPDU-00"});
      } else if (user) {
        // Update password
        bcrypt.hash(req.body.password, 8, function(error, hash) {
          if (error) {
            return res.json({ success: false, message: "Could not create password (Password error).", code: "UPDU-10" });
          } else {
            user.password = hash;
            user.save(function (er, re) {
              if (err) {
                return res.json({ success: false, message: "Unkown error", code: "UPDU-13"});
              } else {
                return res.json({ success: true, message: "Password updated." });
              }
            });
          }
        });
      } else {
        return res.json({ success: false, message: "This account does not exist.", code: "UPDU-02"});
      }
    });
  }
}

exports.update_user = function(req, res) {
  var username_regex = /^([a-zA-Z0-9 ]{2,20})$/;
  var password_regex = (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
  var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var gw2_account = req.body.gw2_account;
  var gw2_account_regex = /^([a-zA-Z]{1,}\.[0-9]{4})$/;

  if (req.query.general) {
    // Update username and gw2_account
    if (!req.body.nick_name || !username_regex.test(req.body.nick_name)) {
      // Validate username
      return res.json({ success: false, message: "User is not correct (alphanumeric characters, maximum length is 20).", code: "UPDU-06" });
    } else if (!gw2_account_regex.test(gw2_account)) {
      // Validate gw2_account
      return res.json({ success: false, message: "GW2 Account is not correct (format: Nakasar.5192).", code: "UPDU-04" });
    } else {
      User.findOne({ _id: req.params.userId}, function(err, user) {
        if (err) {
          return res.json({ success: false, message: "Unkown error", code: "UPDU-00"});
        } else if (user) {
          if (user._id == req.decoded.user_id) {
            // Update this user.
            user.nick_name = req.body.nick_name;
            user.gw2_account = req.body.gw2_account.split(".")[0];
            user.gw2_id = req.body.gw2_account.split(".")[1];
            user.save(function(err, user) {
              if (err) {
                return res.json({ success: false, message: "Unkown error", code: "UPDU-00"});
              } else {
                return res.json({ success: true });
              }
            });
          } else {
            return res.json({ success: false, message: "This username is already used.", code: "UPDU-01"});
          }
        } else {
          return res.json({ success: false, message: "This account does not exist.", code: "UPDU-02"});
        }
      });
    }
  } else if (req.query.security) {
    if (!req.body.new_password || !password_regex.test(req.body.new_password)) {
      // Validate password
      return res.json({ success: false, message: "Password is not correct.", code: "UPDU-05" });
    } else {
      User.findOne({ _id: req.params.userId}, function(err, user) {
        if (err) {
          return res.json({ success: false, message: "Unkown error", code: "UPDU-00"});
        } else if (user) {
          if (user._id == req.decoded.user_id) {
            // Update this user.

            // Check password1
            bcrypt.compare(req.body.old_password, user.password, function(error, result) {
              if (error) {
                return res.json({ success: false, message: "Unkown error", code: "UPDU-12"});
              } else if (result) {
                // Update password
                bcrypt.hash(req.body.new_password, 8, function(error, hash) {
                  if (error) {
                    return res.json({ success: false, message: "Could not create password (Password error).", code: "UPDU-10" });
                  } else {
                    user.password = hash;
                    user.save(function (er, re) {
                      if (err) {
                        return res.json({ success: false, message: "Unkown error", code: "UPDU-13"});
                      } else {
                        return res.json({ success: true, message: "Password updated." });
                      }
                    });
                  }
                });
              } else {
                return res.json({ success: false, message: "Incorrect old password.", code: "UPDU-11"});
              }
            });

          } else {
            return res.json({ success: false, message: "You can only update your own account.", code: "UPDU-15"});
          }
        } else {
          return res.json({ success: false, message: "This account does not exist.", code: "UPDU-02"});
        }
      });
    }
  } else {
    return res.json({ success: false, message: "Wrong declaration of parameters (password or general)."})
  }
};

exports.delete_user = function(req, res) {
  User.findById(req.params.userId, function(err, user) {
    if (err) {
      return res.send(err);
    } else {
      console.error(user._id + " " + req.decoded.user_id);
      if (user._id.equals(req.decoded.user_id) || req.decoded.admin) {
        User.remove({
          _id: req.params.userId
        }, function(err, user) {
          if (err) {
            return res.json({ success: false, error: err });
          }
          return res.json({ success: true, message: 'User successfully deleted' });
        });
      } else {
        return res.json({ success: false, message: 'You can not delete someone else account.'})
      }
    }
  });
};

exports.login_user = function(req, res) {
  User.findOne({ nick_name: req.body.nick_name }, function(err, user) {
    if (err) {
      return res.send(err);
    }

    if(!user) {
      return res.json({ success: false, message: 'User not found.'});
    } else if (user) {
      // check password
      bcrypt.compare(req.body.password, user.password, function(error, result) {
        if (error) {
          return res.json({ success: false, message: 'Auth error.' });
        } else if (result) {
          //create token
          const payload = { admin: user.admin, user_id: user._id };
          var token = jwt.sign(payload, req.app.settings.secretKey, {
            expiresIn: 86400 // 24 hours
          });

          if (!user.active) {
            return res.json({
              success: false,
              message: 'Account not active.',
              code: 'LOG-08'
            });
          } else {
            return res.json({
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
          }
        } else {
          return res.json({ success: false, message: 'Bad credidentials.', code: 'LOG-01' });
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
      return res.json({ success: false, message: "Error while trying to whipe the user database."});
    } else {
      return res.json({ success: true, message: "User database whiped."});
    }
  });
};

exports.get_creations = function(req, res) {
  var userId = req.params.userId;
  console.log(userId);
  User.findById(userId, "_id nick_name", function(err, user) {
    if (err) {
      res.json({ success: false, message: "Unkown error", error: err });
    } else if (user) {
      var events = [];
      Event.find({ owner: userId }, "_id name", function(err, ev) {
        if (err) {

        } else {
          events = ev;

          var locations = [];
          Location.find({ owner: userId }, "_id name", function(err, loc) {
            if (err) {

            } else {
              locations = loc;
            }
          });

          var rumors = [];
          Rumor.find({ owner: userId }, "_id name", function(err, rum) {
            if (err) {

            } else {
              rumors = rum;

              var characters = [];
              Character.find({ owner: userId }, "_id name", function(err, cha) {
                if (err) {
                  console.log(err)
                } else {
                  console.log(cha)
                  characters = cha;

                  res.json({ success: true, user: { _id: userId, nick_name: user.nick_name }, contents: { characters: characters, events: events, locations: locations, rumors: rumors } })
                }
              });
            }
          });
        }
      });
    } else {
      res.json({ success: false, message: "user not found." });
    }

  });
}

exports.set_status = function(req, res) {
  if (req.params.userId) {
    if (req.body.status && req.body.status.length > 0) {
      switch (req.body.status) {
        case "active":
          User.findByIdAndUpdate(req.params.userId, { active: true }, function (err, user) {
            if (err) {
              return res.json({ success: false, message: "Could not update user statis." });
            } else if (user) {
              return res.json({ success: true, message: "User is now active", user: { id: user._id } });
            } else {
              return res.json({ success: false, message: "User not found." });
            }
          });
          break;
        case "inactive":
          User.findByIdAndUpdate(req.params.userId, { active: false }, function (err, user) {
            if (err) {
              return res.json({ success: false, message: "Could not update user statis." });
            } else if (user) {
              return res.json({ success: true, message: "User is now inactive", user: { id: user._id } });
            } else {
              return res.json({ success: false, message: "User not found." });
            }
          });
          break;
        default:
          return res.json({ success: false, message: "New status invalid 'active' or 'inactive'" });
          break;
      }
    } else {
      return res.json({ success: false, message: "New status not specified ({ status: 'active' })." });
    }
  } else {
    return res.json({ success: false, message: "Unspecified user." });
  }
};
