# 🛡️ HACCPManager

> **Progiciel de gestion de la sécurité alimentaire** — Contrôles qualité, traçabilité HACCP, alertes temps réel et rapports de conformité pour les professionnels de la restauration et de l'agro-alimentaire.

![CI/CD](https://github.com/mekid-asmaa-hayat/haccpmanager/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20NestJS%20%7C%20PostgreSQL-informational)

---

## 📋 Présentation

**HACCPManager** est un progiciel métier complet dédié aux professionnels du secteur alimentaire (restaurants, industries agro-alimentaires, traiteurs). Il permet de :

- **Saisir et suivre les contrôles HACCP** (températures, dates de péremption, conformité des équipements)
- **Gérer les produits et lots** avec traçabilité complète
- **Détecter automatiquement les non-conformités** et déclencher des alertes
- **Générer des rapports PDF** de conformité horodatés et signés
- **Configurer les équipements** (tablettes, imprimantes, postes) via un back-office dédié
- **Onboarder et former les utilisateurs** via un tutoriel interactif intégré
- **Importer les données clients** depuis des fichiers CSV/Excel

Ce projet reproduit fidèlement les problématiques d'un éditeur de progiciel tel que **DBF Qualité / Keyfood-HACCP**.

---

## 🏗️ Architecture

```
HACCPManager/
├── backend/                  # API REST — NestJS + TypeORM + PostgreSQL
│   ├── src/
│   │   ├── auth/             # JWT, refresh tokens, guards
│   │   ├── users/            # Gestion des utilisateurs & rôles
│   │   ├── controls/         # Contrôles HACCP (CCP)
│   │   ├── products/         # Produits, lots, traçabilité
│   │   ├── reports/          # Génération de rapports PDF
│   │   └── common/           # Guards, decorators, filters globaux
│   ├── test/                 # Tests unitaires & e2e (Jest)
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # SPA React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/       # Layout, UI, formulaires, dashboard
│   │   ├── pages/            # Auth, Contrôles, Produits, Rapports, Users
│   │   ├── hooks/            # Custom hooks (useAuth, useControls…)
│   │   ├── services/         # Appels API (axios)
│   │   └── types/            # Types TypeScript partagés
│   ├── Dockerfile
│   └── package.json
│
├── docker/
│   └── init.sql              # Initialisation base de données
├── docker-compose.yml        # Stack complète en un seul lancement
└── .github/workflows/
    └── ci.yml                # Pipeline CI/CD — build, test, deploy
```

---

## ⚙️ Stack Technique

| Couche | Technologie |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Query, React Hook Form, Recharts |
| **Backend** | NestJS, TypeORM, JWT Auth, class-validator, Passport.js |
| **Base de données** | PostgreSQL 15 |
| **PDF** | pdfkit |
| **Tests** | Jest, Supertest |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD |
| **Déploiement** | Railway / Render (backend) + Vercel (frontend) |

---

## 🚀 Lancement rapide (Docker)

```bash
# 1. Cloner le projet
git clone https://github.com/mekid-asmaa-hayat/haccpmanager.git
cd HACCPManager

# 2. Copier les variables d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Lancer toute la stack
docker-compose up --build

# ✅ Frontend  → http://localhost:3000
# ✅ Backend   → http://localhost:4000
# ✅ API Docs  → http://localhost:4000/api (Swagger)
```

---

## 🔐 Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrateur** | admin@haccp.fr | Admin1234! |
| **Responsable qualité** | qualite@haccp.fr | Qualite1234! |
| **Opérateur** | operateur@haccp.fr | Operateur1234! |

---

## 📦 Fonctionnalités détaillées

### ✅ Module Contrôles HACCP
- Saisie guidée des points de contrôle critiques (CCP) : température, hygiène, équipements
- Seuils d'alerte configurables par point de contrôle (ex : température > 4°C → alerte rouge)
- Historique complet et filtrable par date, zone, opérateur
- Statuts : `Conforme` / `Non conforme` / `En attente de correction`

### 📦 Module Produits & Traçabilité
- Référentiel produits avec catégories, fournisseurs, DLC/DLUO
- Gestion des lots (numéro de lot, date de réception, quantité)
- Traçabilité ascendante et descendante
- Import en masse via CSV/Excel avec rapport d'erreurs

### 📊 Module Rapports
- Génération de rapports PDF horodatés : conformité journalière, hebdomadaire, mensuelle
- Export CSV des données brutes
- Dashboard avec indicateurs clés : taux de conformité, alertes actives, contrôles du jour

### 👥 Module Utilisateurs & Rôles
- 3 niveaux de droits : `ADMIN`, `QUALITE`, `OPERATEUR`
- Gestion des établissements multi-sites
- Logs d'activité par utilisateur

### 🖥️ Back-office Administration
- Configuration des équipements déclarés (postes, tablettes, imprimantes)
- Paramétrage des seuils et des zones de contrôle
- Intégration / import des données clients depuis CSV

### 🎓 Onboarding interactif
- Tutoriel pas-à-pas au premier login
- Tooltips contextuels sur les fonctionnalités clés
- Guide utilisateur intégré par rôle

---

## 🧪 Tests

```bash
# Backend — tests unitaires
cd backend && npm run test

# Backend — tests e2e
cd backend && npm run test:e2e

# Frontend — tests composants
cd frontend && npm test
```

---

## 🔄 CI/CD Pipeline

Le pipeline GitHub Actions s'exécute à chaque push sur `main` et `develop` :

1. **Lint** — ESLint + Prettier
2. **Build** — Vérification TypeScript
3. **Tests** — Jest unitaires + e2e
4. **Docker Build** — Construction des images
5. **Deploy** — Déploiement automatique sur Railway (backend) et Vercel (frontend)

---

## 📡 API REST — Endpoints principaux

```
POST   /auth/login              Connexion
POST   /auth/refresh            Rafraîchir le token
GET    /controls                Liste des contrôles
POST   /controls                Créer un contrôle
GET    /controls/:id            Détail d'un contrôle
PATCH  /controls/:id            Mettre à jour
GET    /products                Liste des produits
POST   /products/import         Import CSV
GET    /reports/daily           Rapport journalier PDF
GET    /reports/dashboard       Indicateurs dashboard
GET    /users                   Liste utilisateurs (ADMIN)
POST   /users                   Créer un utilisateur
```

Documentation complète disponible sur `/api` (Swagger UI).

---

## 🗄️ Modèle de données

```
User ─────────── Control (1─N)
  │                  │
  └── Etablissement  └── Product
                         │
                         └── Lot
```

---

## 👩‍💻 Auteure

**Mekid Asma Hayet** — Développeuse Full Stack  
[mekid-portfolio.web.app](https://mekid-portfolio.web.app) · [LinkedIn](https://linkedin.com/in/mekid-asma-hayet-014850222) · [GitHub](https://github.com/mekid-asmaa-hayat)
