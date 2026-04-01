# 🛡️ La Escuela De Papa - DevSecOps Project

![DevSecOps](https://img.shields.io/badge/DevSecOps-Ready-success)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![Python](https://img.shields.io/badge/Backend-Flask--Python-yellow)
![React](https://img.shields.io/badge/Frontend-React--Vite-cyan)

## 🎯 Vue d'ensemble du projet
Cette application Full-Stack sécurisée a été conçue en appliquant les principes **Security by Design** de l'OWASP de bout en bout et conteneurisée via Docker. Elle fournit une plateforme de gestion académique.

### Profils RBAC disponibles (Test)
Ces utilisateurs sont créés automatiquement via le script seed :
- **Admin** : `admin` / `password`
- **Professeur** : `prof1` / `password`
- **Étudiant** : `student1` / `password`

---

## 🚀 Lancement (Environnement de Développement)

1. **Construire et démarrer les conteneurs (Docker Compose)**
```bash
sudo docker compose up -d --build
```
2. **Initialiser les données sécurisées** (hachages Bcrypt stricts Python) :
```bash
sudo docker compose exec api python seed.py
```
3. **Accéder à l'application web** :
Rendez-vous sur [http://localhost:5173](http://localhost:5173)

---

## 🔒 Mesures de Sécurité Implémentées (Semaine 1)

Ce dépôt respecte toutes les exigences DevSecOps du projet :

### 1. Sécurité Applicative (AppSec)
* **Authentification Robuste** : Utilisation exclusive du framework de hachage `bcrypt` avec génération aléatoire de Salt.
* **Prévention Injection SQL** : 100% des requêtes passent par le module `api/db.py` utilisant des **requêtes préparées stricts** (connecteur MySQL).
* **Protection CSRF** : Implémentation d'une chaine complète (Axios interceptor + `Flask-WTF`). Tous les appels d'API génèrent un token `X-CSRFToken` unique.
* **Sécurité des Sessions HTTP** : Configuration des cookies de session bloqués pour le JavaScript (`HttpOnly=True` et `SameSite=Lax`) avec une durée de vie stricte de 30 minutes. Invalidation intégrale à la déconnexion.
* **Headers Sécurisés** : Intégration de `Flask-Talisman` pour les politiques CSP et protections (X-Frame, MIME).

### 2. Contrôle d'Accès (RBAC)
* Implémentation paramétrable des middlewares Flask (`@login_required`, `@role_required`).
* Toute tentative de violation du cloisonnement (ex: élève sur URL Admin) lève logiquement une erreur HTTP 403 Forbidden accompagnée d'une trace d'audit d'accès dans la console.

### 3. DevSecOps Pipeline (GitHub Actions CI/CD)
La pipeline `.github/workflows/main.yml` automatise les tests de sécurité de manière transparente au push :
- **Linting** (`flake8`) : Propreté et standards PEP8.
- **SCA** (`safety`) : Scan des vulnérabilités connues (CVE) des paquets Python utilisés.
- **SAST** (`bandit`) : Analyse statique recherchant spécifiquement de mauvais usages de mots de passe ou des failles du langage Python.
- **DAST** (`ZAP`) : Build du backend/frontend interne aux serveurs GitHub pour scanner dynamiquement le système avec l'OWASP ZAP.

---

## 🛠️ Technos Utilisées
* **Frontend** : React.js (Vite), Axios, Interface personnalisée type Glassmorphism.
* **Backend API** : Python 3.11 (Flask API), Bcrypt, MySQL Connector, Docker (non-root runner).
* **Base de données** : MySQL 8.
