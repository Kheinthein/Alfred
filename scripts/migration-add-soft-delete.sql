-- ============================================
-- Script de Modification de la Base de Données
-- Migration: Ajout du soft delete sur les documents
-- Date: 2025-01-28
-- Version: 1.1
-- ============================================

-- Activation des clés étrangères
PRAGMA foreign_keys = ON;

-- ============================================
-- ÉTAPE 1: Vérification de l'état actuel
-- ============================================

-- Vérifier si la colonne deletedAt existe déjà
-- (Cette requête retournera 0 si la colonne n'existe pas)
SELECT COUNT(*) FROM pragma_table_info('documents') WHERE name = 'deletedAt';

-- ============================================
-- ÉTAPE 2: Ajout de la colonne deletedAt
-- ============================================

-- Ajouter la colonne deletedAt à la table documents
-- NULL = document non supprimé, DATETIME = date de suppression
ALTER TABLE documents ADD COLUMN deletedAt DATETIME NULL;

-- ============================================
-- ÉTAPE 3: Création d'un index pour optimiser les requêtes
-- ============================================

-- Index pour filtrer rapidement les documents non supprimés
CREATE INDEX IF NOT EXISTS idx_documents_deletedAt ON documents(deletedAt);

-- Index composite pour les requêtes fréquentes : documents actifs d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_documents_userId_deletedAt ON documents(userId, deletedAt);

-- ============================================
-- ÉTAPE 4: Migration des données existantes (si nécessaire)
-- ============================================

-- Les documents existants ont déjà deletedAt = NULL (non supprimés)
-- Aucune migration de données nécessaire dans ce cas

-- ============================================
-- ÉTAPE 5: Vérification post-migration
-- ============================================

-- Vérifier que la colonne a bien été ajoutée
SELECT name, type, "notnull", dflt_value 
FROM pragma_table_info('documents') 
WHERE name = 'deletedAt';

-- Vérifier que les index ont été créés
SELECT name FROM sqlite_master 
WHERE type = 'index' 
AND name LIKE 'idx_documents%deletedAt%';

-- ============================================
-- FIN DU SCRIPT DE MIGRATION
-- ============================================
