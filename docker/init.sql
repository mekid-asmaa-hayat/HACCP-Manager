-- HACCPManager — Initialisation de la base de données
-- Données de démonstration

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Les tables sont créées automatiquement par TypeORM (synchronize: true en dev)
-- Ce script insère les données de démonstration après la création des tables

-- Note : ce script est exécuté après TypeORM sync via un seed séparé
-- Voir backend/src/common/seed.ts pour les données de démo
