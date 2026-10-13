# What2Do

![Logo](ScreenShotsApp/logo.png)

**What2Do** est une application web fullstack permettant de découvrir des idées d’activités et d’événements à Genève et dans ses environs.  
Elle a été développée dans le cadre de la validation du **certificat de développeur Fullstack**.

L’application s’adresse à trois types d’utilisateurs :

- visiteurs
- utilisateurs inscrits
- établissements

---

## Installation locale

### 1. Restaurer la base de données

Avant de lancer l’application, il faut télécharger mongoDumb pour pouvoir importer la base de donnée pré-remplie. Pour ce faire, il faut effectuer la commande suivante :

```bash
.\mongorestore.exe "chemin\vers\le\dossier\what2do_db"
```

### 2. Lancer le backend

```bash
npm start
```

## 🚀 Fonctionnalités principales

### 🎟️ Événements

- Liste des événements à venir
- Recherche par mots-clés
- Filtres par catégories
- Page de détails pour chaque événement

### 🏢 Établissements

- Liste des établissements proposant des activités
- Recherche et filtres par catégories
- Page de détails avec informations complètes

---

## 👤 Gestion des comptes

### Création de compte

- Compte **Utilisateur** ou **Établissement**
- Validation de l’adresse e-mail via lien de confirmation (logs backend)

### Authentification

- Login avec e-mail, mot de passe et type de compte
- Fonction « Mot de passe oublié »
- Réinitialisation du mot de passe via lien sécurisé

---

## 🧑‍💼 Espace utilisateur

- Consultation et modification du profil
- Gestion des favoris
- Consultation des commentaires laissés

---

## 🏬 Espace établissement

- Gestion des informations de l’établissement
- Création, modification et suppression d’événements
- Vue centralisée des événements publiés

---

## 🛠️ Technologies & concepts

- Frontend & Backend fullstack
- API REST
- Authentification et autorisation
- Gestion des rôles (Utilisateur / Établissement)
- CRUD complet
- Routing protégé
- Validation des formulaires
- Gestion des erreurs

---
