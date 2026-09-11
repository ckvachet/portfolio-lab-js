# Micro-Dixie

## Objectif du projet

Micro-Dixie est un mini tableau de bord d'administration local développé progressivement en HTML, CSS et JavaScript.

L'objectif est de construire une interface simple, propre et évolutive permettant de gérer des utilisateurs, leurs rôles et des modules activables.

## Version actuelle

Version actuelle : DV10 - Stabilisation finale dashboard CRM.

Micro-Dixie CRM est un dashboard CRM local de démonstration pédagogique : sidebar fixe, header système avec heure locale, footer professionnel, tableau utilisateurs, fiches utilisateur dockables (dock multi-fenêtres), historique de versioning, export CSV/JSON et impression fiche, journal d'activité, notifications, thème clair/sombre, graphique animé de répartition des rôles, gestion actif/inactif et sécurité de suppression. Projet pédagogique — données fictives uniquement, aucun backend.

## Fonctionnalités prévues

- ajout dynamique d’utilisateurs ;
- validation simple du formulaire ;
- messages d’erreur et de succès ;
- suppression d’un utilisateur ;
- compteur d’utilisateurs ;
- badges visuels par rôle.

- sauvegarde locale des utilisateurs ;
- restauration des utilisateurs après rechargement ;
- synchronisation du compteur avec les données sauvegardées.

- recherche par nom/email ;
- filtres par rôle ;
- compteur total et compteur filtré ;
- réinitialisation des filtres.

- import JSON des utilisateurs ;
- export JSON des utilisateurs ;
- chargement de données de démonstration ;
- contrôle basique des fichiers importés ;
- regroupement des actions de gestion des données ;
- cartes statistiques par rôle ;
- journal d'activité local ;
- action de vidage complet avec confirmation ;
- amélioration visuelle du tableau de bord.


- fiche utilisateur détaillée en modale ;
- ID utilisateur local (USR-xxxx) ;
- avatar par initiales ;
- champs adresse, localité, téléphone privé, téléphone professionnel et date de naissance ;
- import/export compatibles avec les champs enrichis ;
- mode clair/sombre ;
- bouton retour haut de page ;
- amélioration visuelle générale.

## Méthode de travail

Le projet est construit par petites versions appelées DV.

Chaque étape est développée dans VS Code, testée, documentée puis versionnée avec Git et GitHub.

L'intelligence artificielle est utilisée comme appui technique, relire le code, proposer des corrections et améliorer la documentation.

## DV9.5 — Header, footer et navigation

Cette version prépare une navigation globale pour le Portfolio Lab JS : un header moderne (effet glass léger, menu responsive) et un footer professionnel. `Micro-Dixie` reste une démo intégrée au laboratoire et un lien vers l'accueil a été ajouté. Les chemins relatifs sont préservés.

## DV10 — Stabilisation finale dashboard CRM

Version finale de présentation : harmonisation visuelle (header, sidebar, cartes, tableau, footer), vérification de la sécurité de suppression, des exports/imports, de l'impression fiche, des fenêtres dockables, des notifications et de l'animation du graphique de rôles. Nettoyage des mentions obsolètes dans l'interface principale (les liens Portfolio/GitHub restent uniquement dans le footer). Projet pédagogique — données fictives uniquement.
