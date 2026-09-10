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
