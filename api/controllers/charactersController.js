'use strict';

var mongoose = require('mongoose'), Character = mongoose.model('Characters');

const value_regex = /^[+-]{0,1}[0-9]{1,2}$/;
const character_name_regex = /^[a-zA-Z \-_'\u00C0-\u017F]{0,40}$/;

exports.list_all_characters = function(req, res) {
  if (req.query.search_terms) {
    if (character_name_regex.test(req.query.search_terms)) {
      Character.find( { $text: { $search: search_terms } } ).exec(function(err, characters) {
        if (err) {
          return res.json({ success: false, message: err , search_terms: req.query.search_terms});
        }
        return res.json({ success: true, search_terms: req.query.search_terms, characters: characters });
      });
    } else {
      return res.json({ success: false, message: "search_terms may only contain alphanumeric characters (a-Z, accents, 0-9, ', -, )" });
    }
  } else {
    Character.find( {} ).exec(function(err, characters) {
      if (err) {
        return res.json({ success: false, message: err });
      }
      return res.json({ success: true, characters: characters });
    });
  }
}

exports.create_character = function(req, res) {
  var new_character = new Character(req.body);
  new_character.owner = req.decoded.user_id;
  new_character.save(function(err, character) {
    if (err) {
      return res.json({ success: false, message: err });
    }
    return res.json({ success: true, character: character });
  });
}

exports.read_character = function(req, res) {
  Character.findById(req.params.characterId, function(err, character) {
    if (err) {
      return res.json({ success: false, message: err });
    }
    return res.json({ success: true, character: character });
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
        if (req.body.status) {
          if (["npc", "dead", "played"].indexOf(req.body.status) > -1) {
            character.status = req.body.status;
          } else {
            return res.json({ success: false, message: "Status must be npc, dead or played."})
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
  for (var caractIndex = 0; caractIndex < character.caracteristics.length; caractIndex++) {
    names.push(character.caracteristics[caractIndex].name);
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
  for (var skillIndex = 0; skillIndex < character.skills.length; skillIndex++) {
    names.push(character.skills[skillIndex].name);
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
