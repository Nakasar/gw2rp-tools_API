gw2rp-tools_API
==================
Utilisation
-------------------
**Les requêtes suivants sont accessibles sans authentification :**  
Il est possible d'obtenir la liste des évènements à l'adresse `/api/events` (requête GET). L'adresse `/api/events/<eventId>` permet d'obtenir les détails sur un évènement particulier.  
La liste des lieux s'obtient à l'adresse `/api/events` (requête GET).  L'adresse `/api/locations/<locationId>` permet d'obtenir les détails sur un lieux particulier.  

| /api/me | | |
| ---- | ---- | ---- |
| POST | | Vérifie la validité du token vis à vis de l'utilisateur renseigné. |

| /api/login | | |
| ---- | ---- | ---- |
| POST | | Retourne un token pour le nickname et le mot de passe envoyé s'ils sont corrects. |

| /api/signup | | |
| ---- | ---- | ---- |
| POST | | Ajoute un nouvel utilisateur. |

| /api/users | | |
| ---- | ---- | ---- |
| GET | authentifié | Retourne la liste des utilisateurs |
| POST | admin | ajoute un utilisateur pouvant être administrateur |

| /api/users/_\<userId\>_ | | |
| ---- | ---- | ---- |
| GET | authentifié | Retourne les détails de l'utilisateur spécifié. |
| PUT | authentifié | Met à jour l'utilisateur (si le token correspond au même utilisateur) |

| /api/events | | |
| ---- | ---- | ---- |
| GET | | Retourne la liste des events |
| POST | authentifié | ajoute un évent |
| DELETE | admin | supprime tous les évents. |

| /api/events/_\<eventId\>_ | | |
| ---- | ---- | ---- |
| GET | | Retourne les détails de l'évent précisé. |
| PUT | authentifié | met à jour l'évènement s'il appartient à cet utilisateur |
| DELETE | authentifié | supprime l'évènement s'il appartient à cet utilisateur |

| /api/locations | | |
| ---- | ---- | ---- |
| GET | | Retourne la liste des lieux |
| POST | authentifié | ajoute un lieu |
| DELETE | admin | Supprime tous les lieux |

| /api/locations/_\<locationId\>_ | | |
| ---- | ---- | ---- |
| GET | | Retourne les détails du lieu précisé. |
| PUT | authentifié | Met à jour un lieu s'il appartient à cet utilisateur |
| DELETE | authentifié | Supprime un lieu s'il appartient à cet utilisateur |

| /api/locations | | |
| ---- | ---- | ---- |
| GET | | Retourne la liste des lieux |
| POST | authentifié | ajoute un lieu |
| DELETE | admin | Supprime tous les lieux |

| /api/locations/_\<locationId\>_ | | |
| ---- | ---- | ---- |
| GET | | Retourne les détails du lieu précisé. |
| PUT | authentifié | Met à jour un lieu s'il appartient à cet utilisateur |
| DELETE | authentifié | Supprime un lieu s'il appartient à cet utilisateur |

| /api/characters | | |
| ---- | ---- | ---- |
| GET | | Retourne la liste des personnages |
| POST | authentifié | ajoute un personnage |
| DELETE | admin | Supprime tous les personnages |

| /api/characters/_\<characterId\>_ | | |
| ---- | ---- | ---- |
| GET | | Retourne les détails du personnage. |
| PUT | authentifié | Met à jour un personnage s'il appartient à cet utilisateur |
| DELETE | authentifié | Supprime un personnage s'il appartient à cet utilisateur |

| /api/characters/_\<characterId\>_/skills | | |
| ---- | ---- | ---- |
| PUT | authentifié | Met à jour la liste des compétences d'un personnage s'il appartient à cet utilisateur |
| DELETE | authentifié | Supprime tout ou partie de la liste des compétences du personnage s'il appartient à cet utilisateur |

| /api/characters/_\<characterId\>_/caracs | | |
| ---- | ---- | ---- |
| PUT | authentifié | Met à jour la liste des caractéristiques d'un personnage s'il appartient à cet utilisateur |
| DELETE | authentifié | Supprime tout ou partie de la liste des caractéristiques du personnage s'il appartient à cet utilisateur |

API Models
-----------
### Utilisateurs
| _field_ | _type_ | _description_ |
| ------ | ----- | ----- |
| nick\_name | String | Nom d'affichage de l'utilisateur (et login) |
| register\_date | Date | date d'enregistrement de l'utilisateur |
| gw2\_account | String | Nom de compte GW2 de l'utilisateur (optionnel) |
| gw2\_id | Number | ID de compte GW2 de l'utilisateur |
| email | String | Email de l'utilisateur (n'est pas retourné par l'API) |
| password | String | mot de passe de l'utilisateur (n'est pas retourné par l'API) |
| admin | Boolean | Indique si l'utilisateur est administrateur ou non (n'est pas retourné par l'API) |

### Events
| _field_ | _type_ | _description_ |
| ------ | ----- | ----- |
| name | String | nom d'affichage de l'évent |
| created\_at | Date | date d'enregistrement de l'évent |
| icon | String | nom de l'icône à afficher pour l'évent |
| owner | String | ID de l'utilisateur qui a enregistré l'évent |
| coord | String | Coordonnées de l'évent dans le monde, de la forme '\[x, y\]' |
| types | \[String\] | Typse de l'évènement |
| description | String | Description de l'évènement |
| contact | String | Personne à contacter en jeu pour avoir plus d'informations. |
| site | String | Adresse optionnelle d'un site web. |
| end\_date | String | Date de fin de l'évènement. |
| category | String | Valeur à 'event' pour un évent. |
| difficulty | String | Difficulté de l'évènement. |

### Lieux
| _field_ | _type_ | _description_ |
| ------ | ----- | ----- |
| name | String | nom d'affichage de l'évent |
| created\_at | Date | date d'enregistrement de l'évent |
| icon | String | nom de l'icône à afficher pour l'évent |
| owner | String | ID de l'utilisateur qui a enregistré l'évent |
| coord | String | Coordonnées de l'évent dans le monde, de la forme '\[x, y\]' |
| types | \[String\] | Types de l'évènement |
| description | String | Description de l'évènement |
| contact | String | Personne à contacter en jeu pour avoir plus d'informations. |
| site | String | Adresse optionnelle d'un site web. |
| hours | String | Horaires d'ouverture du lieu. |
| category | String | Valeur à 'location' pour un lieu. |

### Personnages
| _field_ | _type_ | _description_ |
| ------ | ----- | ----- |
| name | String | nom du personnage. |
| created\_at | Date | date d'enregistrement du personnage. |
| last\_update | Date | date de dernière modification du personnage. |
| owner | String | ID de l'utilisateur qui a enregistré le personnage. |
| description | String | Description du personnage. |
| appearance | String | Description visuelle du personnage |
| skills | [{name: String, value: Number, remark: String}] | Liste des compétences du personnage. |
| caracteristics |[{name: String, value: Number, remark: String}] | Liste des caractéristiques du personnage. |
