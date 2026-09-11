# Journal de versioning - Micro-Dixie

Ce fichier suit l'évolution du projet version par version.

## DV0 - Fondation du projet

Date : 10/09/2026

Objectif :
Préparer la structure du projet, le README initial et le journal de versioning.

Fonctionnalités ajoutées :
- création de la structure de dossiers ;
- création des fichiers de base ;
- rédaction du README initial ;
- création du journal de versioning.

Fichiers concernés :
- README.md
- docs/journal-versioning.md
- index.html
- css/style.css
- js/app.js

Tests réalisés :
- vérification visuelle de la structure dans VS Code ;
- vérification de la présence des fichiers attendus.

## DV2 - Ajout utilisateur en JavaScript

Date : 10/09/2026

Fonctionnalités ajoutées :
- lecture des champs du formulaire ;
- écoute de l'événement submit ;
- prévention du rechargement de la page ;
- ajout dynamique d'une ligne dans le tableau ;
- suppression de l'état vide après le premier ajout ;
- remise à zéro du formulaire après ajout.

Fichiers concernés :
- index.html
- js/app.js
- README.md
- docs/journal-versioning.md

## DV3 - Gestion utilisateur utilisable

Date : 10/09/2026

Objectif :
Rendre la gestion utilisateur plus concrète avec validation, suppression, compteur et badges de rôle.

Fonctionnalités ajoutées :
- validation simple des champs ;
- message d'erreur si le formulaire est incomplet ;
- message de succès après ajout ;
- suppression d'un utilisateur ;
- compteur d'utilisateurs ;
- badges visuels selon le rôle ;
- retour automatique à l'état vide si le tableau ne contient plus d'utilisateur.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md
- docs/journal-versioning.md

Tests réalisés :
- ajout avec formulaire vide ;
- ajout avec formulaire complet ;
- suppression d'un utilisateur ;
- retour à l'état vide après suppression ;
- vérification du compteur.

Résultat :
La gestion utilisateur de base est opérationnelle en test manuel.

## DV4 - Sauvegarde locale avec localStorage

Date : 10/09/2026

Objectif :
Conserver les utilisateurs ajoutés après rechargement de la page.

Fonctionnalités ajoutées :
- sauvegarde des utilisateurs dans localStorage ;
- restauration automatique des utilisateurs au chargement ;
- mise à jour du stockage après suppression ;
- compteur synchronisé avec les données sauvegardées ;
- état vide cohérent après rechargement.

Fichiers concernés :
- js/app.js
- README.md
- docs/journal-versioning.md
- index.html

Tests réalisés :
- ajout d’un utilisateur puis rechargement ;
- suppression d’un utilisateur puis rechargement ;
- vérification du compteur après rechargement ;
- vérification de l’état vide après suppression complète.

Résultat :
La sauvegarde locale des utilisateurs est opérationnelle en test manuel.

## DV5 - Recherche et filtres utilisateurs

Date : 10/09/2026

Objectif :
Ajouter une recherche par nom/email, des filtres par rôle, et des compteurs total/filtré sans casser la persistance locale.

Fonctionnalités ajoutées :

Fichiers concernés :

Tests réalisés :

Résultat :
La recherche et les filtres fonctionnent en mode local, avec persistance DV4 conservée.

## DV6 - Tableau de bord avancé local

Date : 10/09/2026

Objectif :
Renforcer Micro-Dixie avec des statistiques, un journal d'activité et une action de vidage contrôlée.

Fonctionnalités ajoutées :
- cartes statistiques par rôle ;
- journal d'activité local ;
- suivi des ajouts et suppressions ;
- action de vidage complet avec confirmation ;
- amélioration visuelle du tableau de bord.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md
- docs/journal-versioning.md

Tests réalisés :
- ajout de plusieurs utilisateurs ;
- vérification des statistiques ;
- suppression d'un utilisateur ;
- vérification du journal d'activité ;
- vidage complet avec confirmation ;
- rechargement de la page après vidage.

Résultat :
Le tableau de bord local dispose maintenant d'indicateurs et d'un suivi d'activité de session.

## DV7 - Gestion avancée des données

Date : 10/09/2026

Objectif :
Ajouter des fonctions de gestion des données locales avec import, export et données de démonstration.

Fonctionnalités ajoutées :
- export JSON des utilisateurs ;
- import JSON depuis un fichier local ;
- vérification basique de la structure importée ;
- protection contre l’écrasement en cas de fichier invalide ;
- chargement de données de démonstration ;
- regroupement des actions de données dans l'interface.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md
- docs/journal-versioning.md

Tests réalisés :
- export d’une liste vide ;
- export d’une liste contenant plusieurs utilisateurs ;
- import d’un fichier JSON valide ;
- import d’un fichier JSON invalide ;
- chargement des données de démonstration ;
- rechargement de la page après import ou chargement démo.

Résultat :
Micro-Dixie permet maintenant d’importer, exporter et préparer des données locales de test.

## DV8 - Édition utilisateur et finition UI

Date : 10/09/2026

Objectif :
Ajouter la modification d’un utilisateur existant et améliorer les libellés de l’interface.

Fonctionnalités ajoutées :
- bouton Modifier sur chaque ligne utilisateur ;
- préremplissage du formulaire en mode édition ;
- mise à jour d’un utilisateur existant ;
- annulation du mode édition ;
- sauvegarde des modifications dans localStorage ;
- journalisation des modifications ;
- remplacement des libellés Importer JSON et Exporter JSON par des libellés plus professionnels.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md
- docs/journal-versioning.md

Tests réalisés :
- modification du nom d’un utilisateur ;
- modification du rôle d’un utilisateur ;
- annulation du mode édition ;
- rechargement de la page après modification ;
- vérification des statistiques ;
- vérification de l’import/export après modification.

Résultat :
Micro-Dixie permet maintenant d’ajouter, modifier, supprimer, importer et exporter des utilisateurs.

## DV9 - Fiche utilisateur avancée

Date : 10/09/2026

Objectif :
Ajouter une fiche utilisateur complète en modale avec informations complémentaires, ID local, avatar par initiales et amélioration visuelle.

Fonctionnalités ajoutées :
- modale d’édition utilisateur ;
- ID utilisateur local unique (format USR-0001) ;
- avatar par initiales ;
- champs adresse, localité, téléphone privé, téléphone professionnel et date de naissance ;
- sauvegarde localStorage des données enrichies ;
- import/export compatible avec les nouveaux champs ;
- données de démonstration enrichies ;
- mode clair/sombre sauvegardé ;
- bouton retour haut de page ;
- amélioration visuelle générale.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md
- docs/journal-versioning.md

Tests réalisés :
- ouverture et fermeture de la modale ;
- modification des informations détaillées ;
- annulation d’une modification ;
- sauvegarde après rechargement ;
- import et export de données enrichies ;
- chargement des données de démonstration ;
- test du mode clair/sombre ;
- test du retour haut de page.

Résultat :
Micro-Dixie propose maintenant une fiche utilisateur détaillée et une interface plus proche d’un outil d’administration complet.

Note : L'historique des versions est désormais consultable depuis l'interface via le bouton "Historique" dans le header (ouvre une modale listant DV1→DV9).

## DV9.5 - Header, footer et navigation globale

Date : 11/09/2026

Objectif :
Préparer une navigation partagée pour le Portfolio Lab JS en ajoutant un header moderne et un footer professionnel, sans modifier la logique métier de Micro-Dixie.

Fonctionnalités ajoutées :
- header global avec effet glass léger et menu responsive ;
- liens : Accueil, Micro-Dixie, Démos et bouton Démo ;
- footer professionnel avec mentions et liens vers portfolio/GitHub ;
- préparation de la structure de navigation pour futures démos ;
- modifications CSS et petit script JS pour le menu responsive.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md

Tests réalisés :
- vérification de l'ouverture/fermeture du menu responsive ;
- vérification visuelle du header glass et du footer ;
- vérification que les fonctionnalités Micro-Dixie (modale, import/export, stats) ne sont pas affectées.

Résultat :
Navigation et structure visuelle améliorées, prêtes à intégrer d'autres démonstrations du laboratoire.

## DV10 - Stabilisation finale dashboard CRM

Date : 11/09/2026

Objectif :
Finaliser et harmoniser Micro-Dixie CRM pour une présentation recruteur, sans ajouter de nouvelle fonctionnalité majeure.

Fonctionnalités stabilisées :
- interface dashboard CRM avec sidebar fixe, header système et footer professionnel 4 colonnes ;
- fenêtres dockables (fiches utilisateur, historique) avec dock multi-fenêtres ;
- exports CSV/JSON et impression fiche (compatibles Excel) ;
- journal d'activité et notifications toast ;
- sécurité de suppression (fiche ouverte/minimisée protégée, confirmation systématique) ;
- gestion actif/inactif avec badges de statut ;
- graphique animé de répartition des rôles, mis à jour sur toute action utilisateur ;
- cohérence visuelle des couleurs de rôle et de statut, espacements harmonisés.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md
- docs/journal-versioning.md

Tests réalisés :
- vérification des fenêtres dockables (ouverture, fermeture, minimisation, restauration, dock) ;
- vérification de la sécurité de suppression et du vidage complet ;
- vérification des exports/imports et de l'impression fiche ;
- vérification des notifications et du journal d'activité ;
- vérification de l'animation du graphique de rôles après chaque action ;
- vérification rapide du responsive.

Résultat :
Micro-Dixie CRM DV10 - dashboard CRM local de démonstration, pédagogique, données fictives uniquement, prêt pour une présentation recruteur.

## DV7 - Gestion avancée des données

Date : 10/09/2026

Objectif :
Ajouter des fonctions de gestion des données locales avec import, export et données de démonstration.

Fonctionnalités ajoutées :
- export JSON des utilisateurs ;
- import JSON depuis un fichier local ;
- vérification basique de la structure importée ;
- protection contre l’écrasement en cas de fichier invalide ;
- chargement de données de démonstration ;
- regroupement des actions de données dans l’interface.

Fichiers concernés :
- index.html
- css/style.css
- js/app.js
- README.md
- docs/journal-versioning.md

Tests réalisés :
- export d’une liste vide ;
- export d’une liste contenant plusieurs utilisateurs ;
- import d’un fichier JSON valide ;
- import d’un fichier JSON invalide ;
- chargement des données de démonstration ;
- rechargement de la page après import ou chargement démo.

Résultat :
Micro-Dixie permet maintenant d’importer, exporter et préparer des données locales de test.
