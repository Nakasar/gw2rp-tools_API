'use strict';

var mongoose = require('mongoose'), Guild = mongoose.model('Guilds');

const string_regex = /^([a-z]{1,})$/;
const guild_name_regex = /^([a-zA-Z -'0-9]{1,})$/;

var mockGuilds = [
  {
    _id: "0655624ad551a",
    name: "Pacte des Oubliés",
    image: "azdazd",
    tags: ["mercenaires", "explorateurs"],
    site: "http://example.com",
    summary: "Guilde de chasseurs d'artefacts et d'explorateurs basée au Pavillon de Chasse dans la Vallée de la Reine.",
    description: `
    Nous pratiquons le Roleplay principalement.

Comme son nom l'indique, la guilde a pour but de retrouver des objets ou des savoirs oubliés. Pour cela, trois phases sont nécessaires, correspondant aux trois axes de la guilde :
1) Un axe de Recherche Préliminaire : Basé sur l'étude de cartes, de textes, voire même d'objet, de dessin ou autre. Peu importe tant qu'il y a une indication vers l'objet souhaité.
2) Un axe d'Exploration et de Récupération de l'objet : C'est la partie sur le terrain de la guilde, la partie dédiée plus aux aventuriers et aux amateurs d'action. Car qui sait, ce que nous pourrons rencontrer en chemin. Cependant chacun est libre de participer.
3) Un axe d'Etude d'objet : Etudier sa magie, ses effets, découvrir ses secrets, s'il possède des mécanismes ou autre... Si il cache autre chose.. Estimer aussi sa valeur marchande. Et décider si l'objet peut-être vendu ou doit être confié à un organisme plus approprié.

Le but n'est pas de cheaté les gens avec des objets.

Pour la guilde, nous recherchons tout profils, mages, érudits, aventuriers, mercenaires... Chacun aura une utilité. Peu nous importe votre race, votre classe ou votre origine sociale.
De plus, une spécialisation dans un des trois axes, ne rend pas hermétique au reste. Chacun est libre de participer à ce qu'il préfère. Il peut y avoir des gens qui vont suivre toutes les étapes de récupération d'un objet et pas d'un autre, ou bien des gens qui ne feront qu'un axe. Comme bon vous semble.
Le but étant aussi d'apprendre les uns des autres, découvrir d'autre choses.
    `.trim(),
    members: [
      {
        _id: "699zad495azd",
        nick_name: "Nakasar",
        role: "master"
      },
      {
        _id: "4852ffa2215",
        nick_name: "Naliia",
        role: "officer"
      },
      {
        _id: "59a62d5z6da",
        nick_name: "Gifter",
        role: "member"
      }
    ],
    locations: [
      {
        _id: "5925464584",
        name: "Pavillon de Chasse",
        type: "rp"
      },
      {
        _id: "115",
        name: "Bettletun",
        type: "gw2"
      }
    ]
  },
  {
    _id: "85az9d22aza1f",
    name: "Unité Sentinelle",
    image: "/src/img/bg/purty_wood.png",
    tags: ["séraphins", "enquêtes", "militaires"],
    summary: "Unité de séraphins spécialisés dans les affaires extérieures."
  },
  {
    _id: "5a8d89a2ff9a",
    name: "Caravaniers",
    tags: ["mercenaires"]
  }
]

exports.get_all_guilds = function(req, res) {
  var guilds = []
  for (var guild of mockGuilds) {
    guilds.push({ _id: guild._id, name: guild.name, image: guild.image, tags: guild.tags, summary: guild.summary })
  }
  return res.json({ success: true, guilds: guilds })
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
  return res.json({ success: true, guild: "none" })
}

exports.delete_guild = function(req, res) {
  return res.json({ success: true, message: "Guild deleted." })
}

exports.delete_all_guilds = function(req, res) {
  Guild.remove({}, function(err) {
    if (err) {
      return res.json({ success: false, message: err })
    }
    return res.json({ success: true, message: "All guild deleted." })
  })
}
