gw2rp-tools_API
==================

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
| coord | String | Coordonnées de l'évent dans le monde, de la forme '[x, y]' |
| type | String | Type de l'évènement |
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
| coord | String | Coordonnées de l'évent dans le monde, de la forme '[x, y]' |
| type | String | Type de l'évènement |
| description | String | Description de l'évènement |
| contact | String | Personne à contacter en jeu pour avoir plus d'informations. |
| site | String | Adresse optionnelle d'un site web. |
| hours | String | Horaires d'ouverture du lieu. |
| category | String | Valeur à 'location' pour un lieu. |
