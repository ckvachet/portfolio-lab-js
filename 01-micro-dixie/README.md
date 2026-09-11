# Micro-Dixie CRM

Micro-Dixie CRM est un tableau de bord CRM local développé en HTML, CSS et JavaScript. Il centralise la gestion d'utilisateurs fictifs, le suivi des rôles, les statuts, les exports, l'impression de fiches et l'historique d'activité dans une interface admin structurée.

## Objectif

L'objectif est de fournir une base frontend claire pour un dashboard CRM : gestion utilisateur, visualisation des données, fenêtres de travail réutilisables, persistance locale et interactions proches d'un outil métier. La version actuelle fonctionne sans backend afin de rester directement testable dans un navigateur.

## Fonctionnalités principales

- Tableau de bord CRM local.
- Ajout, modification et suppression d'utilisateurs.
- Gestion des rôles : administrateur, éditeur, observateur.
- Gestion du statut actif ou inactif.
- Tableau filtrable et recherchable.
- Compteurs dynamiques.
- Donut chart animé pour la répartition des rôles.
- Historique d'activité local.
- Notifications visuelles.
- Fenêtres utilisateur déplaçables, minimisables et empilables.
- Protection de suppression si une fiche utilisateur est ouverte ou minimisée.
- Export JSON du tableau de bord.
- Export CSV compatible tableur.
- Impression propre d'une fiche utilisateur.
- Thème clair / sombre.
- Interface responsive.
- Sidebar fixe avec sous-menus.

## Stack technique

- HTML5
- CSS3
- JavaScript vanilla
- localStorage
- Git
- GitHub

Aucun framework et aucun backend ne sont utilisés dans cette version.

## Données et sécurité

Micro-Dixie CRM est une démonstration frontend locale. Les données utilisées doivent rester fictives dans cette version. Le stockage `localStorage` sert uniquement à simuler une persistance côté navigateur ; il n'est pas adapté aux données sensibles ou personnelles réelles.

L'architecture peut toutefois évoluer vers une version complète avec frontend séparé, backend PHP, base de données SQL, authentification utilisateur, gestion des rôles, double authentification 2FA, validation serveur, journalisation et mesures de sécurité adaptées à une exploitation réelle ou commerciale.

## Utilisation locale

1. Cloner ou télécharger le dépôt.
2. Ouvrir le dossier `01-micro-dixie`.
3. Ouvrir `index.html` dans un navigateur moderne.
4. Utiliser le bouton `Charger une démonstration` pour tester rapidement les fonctionnalités.

## Exports

- JSON : sauvegarde ou transfert des données du tableau de bord.
- CSV : ouverture et exploitation dans Excel ou LibreOffice Calc.
- Impression : génération d'une fiche utilisateur lisible.

## Versioning

Le projet suit une progression par versions nommées DV.

- DV1 : interface statique.
- DV2 : ajout utilisateur JavaScript.
- DV3 : validation, suppression, compteur et badges.
- DV4 : sauvegarde locale.
- DV5 : recherche et filtres.
- DV6 : tableau de bord local.
- DV7 : thème et gestion UX.
- DV8 : import/export et données de démonstration.
- DV9 : fiche utilisateur avancée.
- DV10 : stabilisation du dashboard CRM.

DV10 stabilise le dashboard CRM actuel et sert de base pour les prochaines versions du projet.

## Auteur

Christophe Kvachet

- Portfolio : https://kvachet.be
- GitHub projet : https://github.com/ckvachet/portfolio-lab-js/tree/main/01-micro-dixie

## Statut

Projet open source et pédagogique. Démonstration frontend locale. Données fictives uniquement dans cette version.