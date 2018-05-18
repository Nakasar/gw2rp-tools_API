'use strict';

var mongoose = require('mongoose'), Character = mongoose.model('Characters');
const User = mongoose.model('Users');

const value_regex = /^[+-]{0,1}[0-9]{1,2}$/;
const character_name_regex = /^[a-zA-Z \-_'\u00C0-\u017F]{0,40}$/;

exports.search_characters = function(req, res) {
  var tags = req.body.tags || req.query.tags;
  var validatedTags = [];
  if (tags && Array.isArray(tags)) {
    for (var tag of tags) {
      if (character_name_regex.test(tag)) {
        validatedTags.push(tag);
      }
    }
  }

  // build search query object
  var query = {};

  var search = req.query.search || req.body.search;
  if (search && character_name_regex.test(search)) {
    query.$text = { $search: search };
  }

  if (validatedTags.length > 0) {
    query.tags = { $in: validatedTags };
  }

  Character.find( query , "_id owner name created_date last_update status tags").exec(function (err, characters) {
    if (err) {
      return res.json({ success: false, message: err, tags: validatedTags });
    }
    return res.json({ success: true, tags: validatedTags, characters: characters });
  });
}

exports.list_all_characters = function(req, res) {
  var search = req.query.search || req.body.search;
  if (search) {
    if (character_name_regex.test(search)) {
      Character.find( { $text: { $search: search } }, "_id owner name created_date last_update status tags" ).exec(function(err, characters) {
        if (err) {
          return res.json({ success: false, message: err, search_terms: search });
        }
        return res.json({ success: true, search_terms: search, characters: characters });
      });
    } else {
      return res.json({ success: false, message: "search_terms may only contain alphanumeric characters (a-Z, accents, 0-9, ', -, )" });
    }
  } else {
    Character.find( {}, "_id owner name created_date last_update status tags" ).exec(function(err, characters) {
      if (err) {
        return res.json({ success: false, message: err });
      }
      return res.json({ success: true, characters: characters });
    });
  }
}

exports.list_all_characters_for_user = function(req, res) {
  if (req.params.userId) {
    Character.find( { owner: req.params.userId }, "name owner created_date status last_update tags" ).exec(function(err, characters) {
      if (err) {
        return res.json({ success: false, message: err });
      }
      return res.json({ success: true, characters: characters });
    });
  }
}

exports.create_character = function(req, res) {
  // Checks if character name in available.
  Character.find({ name: req.body.name }, function(err, characters) {
    if (err) {
      return res.json({ success: false, message: err });
    } else if (characters.length > 0) {
      return res.json({ success: false, message: "Character name already in use.", code: "CHR-10" });
    } else {
      // Create new character.
      var new_character = new Character(req.body);
      new_character.owner = req.decoded.user_id;
      new_character.save(function(err, character) {
        if (err) {
          return res.json({ success: false, message: err });
        }
        return res.json({ success: true, character: character });
      });
    }
  })
}

exports.read_character = function(req, res) {
  Character.findById(req.params.characterId, function(err, character) {
    if (err) {
      return res.json({ success: false, message: "Could not read character." });
    } else if (character) {
      // Get character owner.
      User.findById(character.owner, (err, user) => {
        if (err) {
          return res.json({ success: false, message: "Could not read player of character." });
        } else if (user) {
          character.player = user.nick_name;
          return res.json({ success: true, character: character });
        } else {
          return res.json({ success: true, character: character });
        }
      });
    } else {
      return res.json({ success: false, message: "No character for this id.", code: "CHR-01" });
    }
  });
};

exports.update_character = function(req, res) {
  Character.findById(req.params.characterId, function(err, character) {
    if (err) {
      return res.json({ success: false, message: err });
    } else if (character) {
      if (character.owner === req.decoded.user_id || req.decoded.admin) {
        if (req.body.name) {
          if (character_name_regex.test(req.body.name)) {
            character.name = req.body.name;
          } else {
            return res.json({ success: false, message: "Character name may only contain a-Z, accent, 0-9, _, - and '." });
          }
        }
        if (req.body.description) {
          character.description = req.body.description;
        }
        if (req.body.appearance) {
          character.appearance = req.body.appearance;
        }
        if (req.body.image_url) {
          character.image_url = req.body.image_url;
        }
        if (req.body.tags && Array.isArray(req.body.tags)) {
          character.tags = req.body.tags;
        }
        if (req.body.status) {
          if (["npc", "dead", "played"].indexOf(req.body.status) > -1) {
            character.status = req.body.status;
          } else {
            return res.json({ success: false, message: "Status must be npc, dead or played."})
          }
        }
        if (req.body.skills && Array.isArray(req.body.skills)) {
          character.skills = [];
          for (var i in req.body.skills) {
            if (validateCaracteristic(req.body.skills[i])) {
              character.skills.push(req.body.skills[i]);
            }
          }
        }
        if (req.body.caracteristics && Array.isArray(req.body.caracteristics)) {
          character.caracteristics = [];
          for (var i in req.body.caracteristics) {
            if (validateCaracteristic(req.body.caracteristics[i])) {
              character.caracteristics.push(req.body.caracteristics[i]);
            }
          }
        }
        character.last_update = Date.now();
        character.save(function(err, character) {
          if (err) {
            return res.json({ success: false, message: err });
          };
          return res.json({ success: true, character: character });
        })
      } else {
        return res.json({ success: false, message: 'You are not the owner of this character.'})
      }
    } else {
      return res.json({ success: false, message: 'No character with this id.'});
    }
  });
};

function validateCaracteristic(caracteristic) {
  if (caracteristic.name && caracteristic.value) {
    if (!value_regex.test(caracteristic.value)) {
      return false
    }
    return true
  }
  return false
}

function getCharacterCaract(character) {
  var names = [];
  if (character.caracteristics) {
    for (var caractIndex = 0; caractIndex < character.caracteristics.length; caractIndex++) {
      names.push(character.caracteristics[caractIndex].name);
    }
  }
  return names;
}

exports.update_caracteristics = function(req, res) {
  if (req.body.caracteristics) {
    if (Array.isArray(req.body.caracteristics)) {
      Character.findById(req.params.characterId, function(err, character) {
        if (err) {
          return res.json({ success: false, message: err });
        } else if (character) {

          var names = getCharacterCaract(character);
          for (var caractIndex in req.body.caracteristics) {
            var caract = req.body.caracteristics[caractIndex]

            if (validateCaracteristic(caract)) {
              var index = names.indexOf(caract.name);
              if (index > -1) {
                // replace caract
                character.caracteristics[index] = caract;
              } else {
                // add caract
                character.caracteristics.push(caract);
                names.push(caract.name);
              }
            } else {
              return res.json({ success: false, message: "Caracteristics should be an array caracteristics: [{name:, value:, remark:}]."});
            }
          }
          // save character
          character.save(function(err, character) {
            if (err) {
              return res.json({ success: false, message: err });
            }
            return res.json({ success: true, character: character });
          })
        } else {
          return res.json({ success: false, message: 'No character with this id.' });
        }
      });
    } else {
      return res.json({ success: false, message: "Caracteristics should be an array caracteristics: [{name:, value:, remark:}]."});
    }
  } else {
    return res.json({ success: false, message: "No caracteristics: [{name:, value:, remark:}] to add."})
  }
}

exports.delete_caracteristics = function(req, res) {
  Character.findById(req.params.characterId, function(err, character) {
    if (err) {
      return res.json({ success: false, message: err });
    } else if (character) {
      if (character.owner === req.decoded.user_id || req.decoded.admin) {
        if (req.body.caracteristics) {
          // delete precise caracteristics
          if (Array.isArray(req.body.caracteristics)) {
            for (var caractIndex in req.body.caracteristics) {
              var caract = req.body.caracteristics[caractIndex];
              var index = character.caracteristics.indexOf(caract);
              if (index > -1) {
                character.caracteristics.splice(index, 1); // remove caract
              }
            }
          } else {
            return res.json({ success: false, message: "You must precise caracteristics to remove as an array of caracteristic name: [String]."})
          }
        } else {
          // whipe them all !
          character.caracteristics = [];
        }
        character.save(function(err, character) {
          if (err) {
            return res.json({ success: false, message: err });
          }
          return res.json({ success: true, character: character });
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this character.'})
      }
    } else {
      return res.json({ success: false, message: 'No such character with this id.' });
    }
  });
}

function getCharacterSkills(character) {
  var names = [];
  if (character.skills) {
    for (var skillIndex = 0; skillIndex < character.skills.length; skillIndex++) {
      names.push(character.skills[skillIndex].name);
    }
  }
  return names;
}

exports.update_skills = function(req, res) {
  if (req.body.skills) {
    if (Array.isArray(req.body.skills)) {
      Character.findById(req.params.characterId, function(err, character) {
        if (err) {
          return res.json({ success: false, message: err });
        } else if (character) {

          var names = getCharacterSkills(character);
          for (var skillIndex in req.body.skills) {
            var skill = req.body.skills[skillIndex];
            if (validateCaracteristic(skill)) {
              var index = names.indexOf(skill.name);
              if (index > -1) {
                // replace caract
                character.skills[index] = skill;
              } else {
                // add caract
                character.skills.push(skill);
                names.push(skill.name);
              }
            } else {
              return res.json({ success: false, message: "Skills should be an array caracteristics: [{name:, value:, remark:}]."});
            }
          }
          // save character
          character.save(function(err, character) {
            if (err) {
              return res.json({ success: false, message: err });
            }
            return res.json({ success: true, character: character });
          })
        } else {
          return res.json({ success: false, message: 'No character with this id.' });
        }
      });
    } else {
      return res.json({ success: false, message: "Skills should be an array skills: [{name:, value:, remark:}]."});
    }
  } else {
    return res.json({ success: false, message: "No skills: [{name:, value:, remark:}] to add."})
  }
}

exports.delete_skills = function(req, res) {
  Character.findById(req.params.characterId, function(err, character) {
    if (err) {
      return res.json({ success: false, message: err });
    } else if (character) {
      if (character.owner === req.decoded.user_id || req.decoded.admin) {
        if (req.body.skills) {
          // delete precise skills
          if (Array.isArray(req.body.skills)) {
            for (var skillIndex in req.body.skills) {
              var skill = req.body.skills[skillIndex];
              var index = character.skills.indexOf(skill);
              if (index > -1) {
                character.skills.splice(index, 1); // remove caract
              }
            }
          } else {
            return res.json({ success: false, message: "You must precise skills to remove as an array of skill name: [String]."})
          }
        } else {
          // whipe them all !
          character.skills = [];
        }
        character.save(function(err, character) {
          if (err) {
            return res.json({ success: false, message: err });
          }
          return res.json({ success: true, character: character });
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this character.'})
      }
    } else {
      return res.json({ success: false, message: 'No such character with this id.' });
    }
  });
}

exports.delete_character = function(req, res) {
  Character.findById(req.params.characterId, function(err, character) {
    if (err) {
      return res.json({ success: false, message: err });
    } else if (character) {
      if (character.owner === req.decoded.user_id || req.decoded.admin) {
        Character.remove({
          _id: req.params.characterId
        }, function(err, character) {
          if (err) {
            return res.json({ success: false, message: err });
          }
          return res.json({ success: true, message: 'Character successfully deleted' });
        });
      } else {
        return res.json({ success: false, message: 'You are not the owner of this character.'})
      }
    } else {
      return res.json({ success: false, message: 'No such character with this id.' });
    }
  });
};

exports.delete_all = function(req, res) {
  Character.remove({}, function(err) {
    if (err) {
      return res.json({ success: false, message: "Error while trying to whipe the character database."});
    } else {
      return res.json({ success: true, message: "Character database whiped."});
    }
  });
};

exports.get_stats = function(req, res) {
  Character.findOne( { _id: req.params.characterId }, "_id caracteristics skills", function(err, character){
    if (err) {
      return res.json({ success: false, message: "Unkown error while trying to search for character."});
    } else if (character) {
      var caracs = getCharacterCaract(character);
      var skills = getCharacterSkills(character);

      if (req.body.stats) {
        if (Array.isArray(req.body.stats)) {

          var stats = [];
          for (var caract of character.caracteristics) {
            if (req.body.stats.includes(caract.name)) {
              stats.push({ type: "caracteristic", name: caract.name, value: caract.value, remark: caract.remark });
            }
          }
          for (var skill of character.skills) {
            if (req.body.stats.includes(skill.name)) {
              stats.push({ type: "skill", name: skill.name, value: skill.value, remark: skill.remark });
            }
          }

          return res.json({ success: true, character_id: character._id, stats: stats });
        } else {
          return res.json({ success: false, message: "Request specific stats with an Array : stats: [String]" });
        }
      } else {
        var caracsComplete = [];
        for (var caract of character.caracteristics) {
          caracsComplete.push({ type: "caracteristic", name: caract.name, value: caract.value, remark: caract.remark });
        }
        var skillsComplete = [];
        for (var skill of character.skills) {
          skillsComplete.push({ type: "skill", name: skill.name, value: skill.value, remark: skill.remark });
        }

        return res.json({ success: true, character_id: character._id, caracteristics: caracsComplete, skills: skillsComplete });
      }
    } else {
      return res.json({ success: false, message: "No character with this id."});
    }
  })
}
