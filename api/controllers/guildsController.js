'use strict';

var mongoose = require('mongoose'), Guild = mongoose.model('Guilds');

const url_regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
const string_regex = /^([a-z]{1,})$/;
const guild_name_regex = /^([a-zA-Z \-_'\u00C0-\u017F0-9]{1,50})$/;
const regex_html = /<(.|\n)*?>/;

exports.get_all_guilds = function(req, res) {
  Guild.find({}, function(err, guilds) {
    if (err) {
      return res.json({ success: false, message: "Unknow error while trying to fetch all guild." })
    } else {
      return res.json({ success: true, guilds: guilds })
    }
  })
}

exports.search_guilds = function(req, res) {
  return res.json({ success: true, guilds: [], search: "none" })
}

exports.get_guild = function(req, res) {
  Guild.findById(req.params.guildId, {}, function(err, guild) {
    if (err) {
      return res.json({ success: false, message: err })
    } else if (guild) {
      return res.json({ success: true, guild: guild })
    } else {
      return res.json({ success: false, message: "No guild for this Id.", id: req.params.id })
    }
  })
}

/**
Create a new guild with a name.
{ token, guild_name }
*/
exports.create_guild = function(req, res) {
  if (req.body.guild_name && guild_name_regex.test(req.body.guild_name)) {
    Guild.find({ name: req.body.guild_name }, function(err, guildFound) {
      if (err) {
        return res.json({ success: false, message: "Unkown error while creating guild.", code: "GUI-00" })
      } else if (guildFound.length > 0) {
        return res.json({ success: false, message: "Guild name already used : " + req.body.guild_name, guild_name: req.body.guild_name, code: "GUI-02" })
      } else {
        var new_guild = new Guild()
        new_guild.name = req.body.guild_name
        new_guild.owner = req.decoded.user_id
        if (req.body.summary) {
          new_guild.summary = req.body.summary
        }
        new_guild.save(function(err, guild) {
          if (err) {
            return res.json({ success: false, message: "Unkown error while creating guild.", code: "GUI-00" })
          }
          return res.json({ success: true, message: "Guild created.", guild: guild })
        })
      }
    })
  } else {
    return res.json({ success: false, message: "guild_name not specified or not valid (letters only).", code: "GUI-01" })
  }
}

exports.update_guild = function(req, res) {
  Guild.findById(req.params.guildId, function(err, guild) {
    if (err) {
      return res.json({ success: false, message: "Unkown error while updating guild.", code: "GUI-00" })
    } else if (guild) {
      if (guild.owner == req.decoded.user_id) {
        // Update guild info.
        if (req.body.name) {
          // Check if there is no guild with such name.
          Guild.find({ name: req.body.guild_name }, function(error, guildFound) {
            if (err) {
              return res.json({ success: false, message: "Unkown error while updating guild name.", code: "GUI-00" })
            } else if (guildFound.length > 0) {
              return res.json({ success: false, message: "Guild name already used.", code: "GUI-02" })
            } else {
              // No guild found, modify guild name
              guild.name = req.body.name
              guild.save(function(err, newguild) {
                return res.json({ success: true, guild: guild })
              })
            }
          })
        } else if (req.body.summary) {
          guild.summary = req.body.summary
          guild.save(function(error, newguild) {
            if (err) {
              return res.json({ success: false, message: "Unkown error while updating guild summary.", code: "GUI-00" })
            } else {
              return res.json({ success: true, guild: guild })
            }
          })
        } else if (req.body.description) {
          guild.description = req.body.description
          guild.save(function(error, newguild) {
            if (err) {
              return res.json({ success: false, message: "Unkown error while updating guild description.", code: "GUI-00" })
            } else {
              return res.json({ success: true, guild: guild })
            }
          })
        } else if (req.body.image) {
          guild.image = req.body.image
          guild.save(function(error, newguild) {
            if (err) {
              return res.json({ success: false, message: "Unkown error while updating guild image.", code: "GUI-00" })
            } else {
              return res.json({ success: true, guild: guild })
            }
          })
        } else if (req.body.site) {
          if (url_regex.test(req.body.site)) {
            guild.site = req.body.site
          } else {
            guild.site = ""
          }
          guild.save(function(error, newguild) {
            if (err) {
              return res.json({ success: false, message: "Unkown error while updating guild site.", code: "GUI-00" })
            } else {
              return res.json({ success: true, guild: guild })
            }
          })
        } else if (req.body.tags) {
          if (Array.isArray(req.body.tags)) {
            var validatedTags = []
            req.body.tags.forEach(tag => validatedTags.push(tag.replace(regex_html, "")))
            guild.tags = validatedTags
            guild.save(function(err, newguild) {
              if (err) {
                return res.json({ success: false, message: "Unkown error while updating guild tags.", code: "GUI-00" })
              } else {
                return res.json({ success: true, guild: guild })
              }
            })
          } else {
            return res.json({ success: false, message: "tags should be an array of String." })
          }
        } else {
          return res.json({ success: false, message: "Update guild name, tags, site, image, summary or description." })
        }
      } else {
        return res.json({ success: false, message: "You are not allowed to modify this guild.", code: "GUI-03" })
      }
    } else {
      return res.json({ success: false, message: "There is no guild with such ID.", code: "GUI-01" })
    }
  })
}

exports.delete_guild = function(req, res) {
  Guild.findById(req.params.guildId, function(err, guild) {
    if (err) {
      return res.json({ success: false, message: "Unkown error while trying to delete guild.", code: "GUI-00" })
    } else if (guild) {
      if (guild.owner === req.decoded.id || req.decoded.admin) {
        Guild.remove({ _id: guild._id }, function(error) {
          if (error) {
            return res.json({ success: false, message: "Unkown error while trying to delete guild.", code: "GUI-00" })
          } else {
            return res.json({ success: true, message: "Guild deleted." })
          }
        })
      } else {
        return res.json({ success: false, message: "You are not allowed to delete this guild.", code: "GUI-03" })
      }
    } else {
      return res.json({ success: false, message: "There is no guild with such ID.", code: "GUI-01" })
    }
  })
}

exports.delete_all_guilds = function(req, res) {
  Guild.remove({}, function(err) {
    if (err) {
      return res.json({ success: false, message: err })
    }
    return res.json({ success: true, message: "All guild deleted." })
  })
}
