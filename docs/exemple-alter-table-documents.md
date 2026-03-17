# Exemple ALTER TABLE pour la Table Documents

**Date :** 9 février 2026  
**Usage :** Section 5.5.3 - Script de modification de la base de données  
**Table concernée :** `documents`

---

## 📋 EXEMPLE COMPLET D'ALTER TABLE

### Migration : Ajout du soft delete (suppression logique)

```sql
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
SELECT COUNT(*) FROM pragma_table_info('documents') WHERE name = 'deletedAt';

-- ============================================
-- ÉTAPE 2: Ajout de la colonne deletedAt
-- ============================================

-- Ajouter la colonne deletedAt à la table documents
-- NULL = document non supprimé, DATETIME = date de suppression
ALTER TABLE documents ADD COLUMN deletedAt DATETIME NULL;

-- ============================================
-- ÉTAPE 3: Création d'index pour optimiser les requêtes
-- ============================================

-- Index pour filtrer rapidement les documents non supprimés
CREATE INDEX IF NOT EXISTS idx_documents_deletedAt ON documents(deletedAt);

-- Index composite pour les requêtes fréquentes : documents actifs d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_documents_userId_deletedAt ON documents(userId, deletedAt);

-- ============================================
-- ÉTAPE 4: Vérification post-migration
-- ============================================

-- Vérifier que la colonne a bien été ajoutée
SELECT name, type, "notnull", dflt_value 
FROM pragma_table_info('documents') 
WHERE name = 'deletedAt';

-- Vérifier que les index ont été créés
SELECT name FROM sqlite_master 
WHERE type = 'index' 
AND name LIKE 'idx_documents%deletedAt%';
```

---

## 📝 VERSION SIMPLIFIÉE POUR LE DOSSIER PROJET

### Format minimal recommandé (Section 5.5.3) :

```sql
-- Migration: Ajout du soft delete sur la table documents
-- Date: 2025-01-28

-- Activation des clés étrangères
PRAGMA foreign_keys = ON;

-- Ajouter la colonne deletedAt à la table documents
ALTER TABLE documents ADD COLUMN deletedAt DATETIME NULL;

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_documents_deletedAt ON documents(deletedAt);
CREATE INDEX IF NOT EXISTS idx_documents_userId_deletedAt ON documents(userId, deletedAt);
```

---

## 🎯 EXPLICATIONS POUR VOTRE DOCUMENT

### Objectif de la migration

Cette migration ajoute la fonctionnalité de **soft delete** (suppression logique) sur la table `documents`. Au lieu de supprimer physiquement un document, on marque simplement sa date de suppression avec la colonne `deletedAt`, permettant une récupération ultérieure.

### Justification du besoin

1. **Conformité RGPD** : Le RGPD exige la possibilité de supprimer les données personnelles, mais aussi de les conserver pour des raisons légales ou de récupération.

2. **Récupération d'erreurs** : Les utilisateurs peuvent supprimer un document par erreur. Le soft delete permet de le restaurer sans intervention technique.

3. **Audit et traçabilité** : Conserver les documents supprimés permet de tracker les suppressions pour des analyses et de respecter des obligations légales de conservation.

### Choix techniques

**1. Colonne `deletedAt` plutôt qu'un booléen `isDeleted`**

- ✅ Stocke la date exacte de suppression (utile pour l'audit)
- ✅ Permet de filtrer facilement : `WHERE deletedAt IS NULL` (documents actifs)
- ✅ Plus flexible pour des fonctionnalités futures (ex: purge automatique après X jours)

**2. Valeur NULL pour "non supprimé"**

- ✅ `NULL` est naturellement exclu des requêtes avec `WHERE deletedAt IS NULL`
- ✅ Pas besoin de valeur par défaut
- ✅ Index efficace sur les valeurs NULL dans SQLite

**3. Index créés**

- **Index simple** : `idx_documents_deletedAt` - Pour filtrer rapidement les documents supprimés/non supprimés
- **Index composite** : `idx_documents_userId_deletedAt` - Optimise la requête fréquente "documents actifs d'un utilisateur"

### Impact sur les requêtes

**Avant la migration :**
```sql
SELECT * FROM documents WHERE userId = ?;
```

**Après la migration :**
```sql
SELECT * FROM documents WHERE userId = ? AND deletedAt IS NULL;
```

---

## ✅ CHECKLIST POUR VOTRE DOCUMENT

Pour la Section 5.5.3, vérifier que vous avez :

- [ ] Inclus l'exemple d'ALTER TABLE avec la commande `ALTER TABLE documents ADD COLUMN deletedAt DATETIME NULL;`
- [ ] Mentionné les index créés après l'ALTER TABLE
- [ ] Expliqué l'objectif de la migration (soft delete)
- [ ] Justifié les choix techniques :
  - [ ] Pourquoi `deletedAt` plutôt qu'un booléen
  - [ ] Pourquoi `NULL` pour les documents non supprimés
  - [ ] Pourquoi créer des index après l'ALTER TABLE
- [ ] Mentionné l'impact sur les requêtes existantes

---

## 📚 RÉFÉRENCE

**Fichier source :** `scripts/migration-add-soft-delete.sql`  
**Documentation complète :** `docs/scripts-base-de-donnees.md` (Section 5.5.3 et 5.5.4)

---

**Document généré le :** 9 février 2026
