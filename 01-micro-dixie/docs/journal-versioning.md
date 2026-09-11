Journal de versioning - Micro-Dixie CRM

Ce fichier suit l'evolution du projet Micro-Dixie CRM version par version.

DV0 - Fondation du projet

Date : 10/09/2026

Objectif :
Preparer la structure du projet, le README initial et le journal de versioning.

Fonctionnalites ajoutees :

creation de la structure de dossiers ;

creation des fichiers de base ;

redaction du README initial ;

creation du journal de versioning.

Fichiers concernes :

README.md

docs/journal-versioning.md

index.html

css/style.css

js/app.js

Tests realises :

verification visuelle de la structure dans VS Code ;

verification de la presence des fichiers attendus.

Resultat :
Le socle du projet est en place.

DV1 - Interface statique

Date : 10/09/2026

Objectif :
Mettre en place la premiere interface visuelle de Micro-Dixie.

Fonctionnalites ajoutees :

structure HTML principale ;

formulaire d'ajout utilisateur ;

tableau utilisateur ;

colonnes avatar, nom, email, role et actions ;

premiers styles CSS ;

structure de base JavaScript.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

verification de l'affichage du formulaire ;

verification de l'affichage du tableau ;

verification de la liaison CSS et JavaScript.

Resultat :
L'interface statique de base est disponible.

DV2 - Ajout utilisateur en JavaScript

Date : 10/09/2026

Objectif :
Ajouter dynamiquement un utilisateur depuis le formulaire.

Fonctionnalites ajoutees :

lecture des champs du formulaire ;

ecoute de l'evenement submit ;

prevention du rechargement de la page ;

ajout dynamique d'une ligne dans le tableau ;

suppression de l'etat vide apres le premier ajout ;

remise a zero du formulaire apres ajout.

Fichiers concernes :

index.html

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

ajout d'un utilisateur ;

verification de la ligne ajoutee ;

verification de la remise a zero du formulaire.

Resultat :
L'ajout utilisateur fonctionne en JavaScript.

DV3 - Gestion utilisateur utilisable

Date : 10/09/2026

Objectif :
Rendre la gestion utilisateur plus concrete avec validation, suppression, compteur et badges de role.

Fonctionnalites ajoutees :

validation simple des champs ;

message d'erreur si le formulaire est incomplet ;

message de succes apres ajout ;

suppression d'un utilisateur ;

compteur d'utilisateurs ;

badges visuels selon le role ;

retour automatique a l'etat vide si le tableau ne contient plus d'utilisateur.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

ajout avec formulaire vide ;

ajout avec formulaire complet ;

suppression d'un utilisateur ;

retour a l'etat vide apres suppression ;

verification du compteur.

Resultat :
La gestion utilisateur de base est operationnelle.

DV4 - Sauvegarde locale avec localStorage

Date : 10/09/2026

Objectif :
Conserver les utilisateurs ajoutes apres rechargement de la page.

Fonctionnalites ajoutees :

sauvegarde des utilisateurs dans localStorage ;

restauration automatique des utilisateurs au chargement ;

mise a jour du stockage apres suppression ;

compteur synchronise avec les donnees sauvegardees ;

etat vide coherent apres rechargement.

Fichiers concernes :

js/app.js

README.md

docs/journal-versioning.md

index.html

Tests realises :

ajout d'un utilisateur puis rechargement ;

suppression d'un utilisateur puis rechargement ;

verification du compteur apres rechargement ;

verification de l'etat vide apres suppression complete.

Resultat :
La sauvegarde locale des utilisateurs est operationnelle.

DV5 - Recherche et filtres utilisateurs

Date : 10/09/2026

Objectif :
Ajouter une recherche par nom/email, des filtres par role et des compteurs total/filtre sans casser la persistance locale.

Fonctionnalites ajoutees :

champ de recherche utilisateur ;

filtre par role ;

compteur total ;

compteur des utilisateurs affiches ;

bouton de reinitialisation des filtres ;

synchronisation avec les donnees sauvegardees.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

recherche par nom ;

recherche par email ;

filtre par role ;

reinitialisation des filtres ;

verification du compteur total et du compteur affiche ;

verification de la persistance localStorage.

Resultat :
La recherche et les filtres fonctionnent en mode local.

DV6 - Tableau de bord avance local

Date : 10/09/2026

Objectif :
Renforcer Micro-Dixie avec des statistiques, un journal d'activite et une action de vidage controlee.

Fonctionnalites ajoutees :

cartes statistiques par role ;

journal d'activite local ;

suivi des ajouts et suppressions ;

action de vidage complet avec confirmation ;

amelioration visuelle du tableau de bord.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

ajout de plusieurs utilisateurs ;

verification des statistiques ;

suppression d'un utilisateur ;

verification du journal d'activite ;

vidage complet avec confirmation ;

rechargement de la page apres vidage.

Resultat :
Le tableau de bord local dispose d'indicateurs et d'un suivi d'activite.

DV7 - Gestion avancee des donnees

Date : 10/09/2026

Objectif :
Ajouter des fonctions de gestion des donnees locales avec import, export et donnees de demonstration.

Fonctionnalites ajoutees :

export JSON des utilisateurs ;

import JSON depuis un fichier local ;

verification basique de la structure importee ;

protection contre l'ecrasement en cas de fichier invalide ;

chargement de donnees de demonstration ;

regroupement des actions de donnees dans l'interface.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

export d'une liste vide ;

export d'une liste contenant plusieurs utilisateurs ;

import d'un fichier JSON valide ;

import d'un fichier JSON invalide ;

chargement des donnees de demonstration ;

rechargement de la page apres import ou chargement demo.

Resultat :
Micro-Dixie permet d'importer, exporter et preparer des donnees locales de test.

DV8 - Edition utilisateur et finition UI

Date : 10/09/2026

Objectif :
Ajouter la modification d'un utilisateur existant et ameliorer les libelles de l'interface.

Fonctionnalites ajoutees :

bouton Modifier sur chaque ligne utilisateur ;

pre-remplissage du formulaire en mode edition ;

mise a jour d'un utilisateur existant ;

annulation du mode edition ;

sauvegarde des modifications dans localStorage ;

journalisation des modifications ;

remplacement des libelles Importer JSON et Exporter JSON par des libelles plus professionnels.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

modification du nom d'un utilisateur ;

modification du role d'un utilisateur ;

annulation du mode edition ;

rechargement de la page apres modification ;

verification des statistiques ;

verification de l'import/export apres modification.

Resultat :
Micro-Dixie permet d'ajouter, modifier, supprimer, importer et exporter des utilisateurs.

DV9 - Fiche utilisateur avancee

Date : 10/09/2026

Objectif :
Ajouter une fiche utilisateur complete avec informations complementaires, ID local, avatar par initiales et amelioration visuelle.

Fonctionnalites ajoutees :

fiche utilisateur detaillee ;

ID utilisateur local unique au format USR-0001 ;

avatar par initiales ;

champs adresse, localite, telephone prive, telephone professionnel et date de naissance ;

sauvegarde localStorage des donnees enrichies ;

import/export compatible avec les nouveaux champs ;

donnees de demonstration enrichies ;

mode clair/sombre sauvegarde ;

bouton retour haut de page ;

amelioration visuelle generale.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

ouverture et fermeture d'une fiche utilisateur ;

modification des informations detaillees ;

annulation d'une modification ;

sauvegarde apres rechargement ;

import et export de donnees enrichies ;

chargement des donnees de demonstration ;

test du mode clair/sombre ;

test du retour haut de page.

Resultat :
Micro-Dixie propose une fiche utilisateur detaillee et une interface plus proche d'un outil d'administration complet.

DV9.5 - Header, footer et navigation globale

Date : 11/09/2026

Objectif :
Preparer une navigation partagee pour le Portfolio Lab JS en ajoutant un header moderne et un footer professionnel, sans modifier la logique metier de Micro-Dixie.

Fonctionnalites ajoutees :

header global avec effet glass leger et menu responsive ;

liens de navigation ;

footer professionnel avec mentions et liens vers portfolio/GitHub ;

preparation de la structure de navigation pour futures demos ;

ajustements CSS et JavaScript pour le menu responsive.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

verification de l'ouverture/fermeture du menu responsive ;

verification visuelle du header et du footer ;

verification que les fonctionnalites Micro-Dixie ne sont pas affectees.

Resultat :
Navigation et structure visuelle ameliorees, pretes a integrer d'autres demonstrations du laboratoire.

DV10 - Stabilisation du dashboard CRM

Date : 11/09/2026

Objectif :
Stabiliser Micro-Dixie CRM comme tableau de bord local consultable, testable et presentable en ligne.

Fonctionnalites ajoutees ou stabilisees :

transformation de l'interface en dashboard CRM structure ;

sidebar fixe avec sections organisees et sous-menus repliables ;

header systeme simplifie avec session locale, date, heure dynamique et badge de version ;

footer harmonise avec liens Portfolio et GitHub ;

publication de la demo en ligne via GitHub Pages ;

tableau de bord avec repartition des roles ;

donut chart anime et mis a jour lors des actions utilisateur ;

notifications visuelles lors des actions ;

journal d'activite local ;

fiches utilisateur sous forme de fenetres flottantes ;

fenetres deplacables, minimisables, restaurables et empilables ;

dock des fenetres minimisees en bas a droite ;

pastille d'activite sur les fenetres minimisees ;

mise au premier plan automatique lors du clic ou du deplacement d'une fenetre ;

harmonisation des couleurs de roles entre tableau, badges et fiches ;

gestion actif/inactif avec badges de statut ;

sauvegarde des modifications utilisateur sans fermeture automatique de la fiche ;

suppression possible depuis la fiche utilisateur avec confirmation ;

protection contre la suppression d'un utilisateur si sa fiche est ouverte ou minimisee ;

vidage complet avec confirmation ;

export JSON des donnees du tableau de bord ;

export CSV compatible tableur ;

impression propre d'une fiche utilisateur ;

nettoyage des libelles d'export ;

correction responsive pour les petits ecrans ;

mise a jour du README avec lien de demo en ligne.

Fichiers concernes :

index.html

css/style.css

js/app.js

README.md

docs/journal-versioning.md

Tests realises :

ouverture de la demo depuis GitHub Pages ;

verification du chargement de index.html, css/style.css et js/app.js ;

ouverture, fermeture, minimisation et restauration des fenetres ;

verification du dock multi-fenetres ;

verification de la mise au premier plan des fenetres ;

modification d'un utilisateur depuis une fiche ouverte ;

verification de la mise a jour directe du tableau de bord ;

verification des badges de roles et de statuts ;

verification de la securite de suppression ;

verification de l'export JSON ;

verification de l'export CSV compatible tableur ;

verification de l'impression d'une fiche utilisateur ;

verification des notifications et du journal d'activite ;

verification de l'animation du graphique de roles ;

verification responsive a 480 px.

Resultat :
Micro-Dixie CRM DV10 est une version stable du dashboard CRM local. La demo est publiee et testable en ligne via GitHub Pages.

Demo en ligne :
https://ckvachet.github.io/portfolio-lab-js/01-micro-dixie/

Note technique :
Cette version fonctionne sans backend et utilise localStorage pour la persistance locale. L'architecture peut evoluer vers une version complete avec frontend separe, backend PHP, base de donnees SQL, authentification utilisateur, gestion des roles, double authentification 2FA, validation serveur, journalisation et securite adaptee a une exploitation reelle ou commerciale.