# Exemples CREATE TABLE pour le Dossier Projet

**Date :** 9 février 2026  
**Usage :** Section 5.5.1 - Script de création de la base de données

---

## 📋 EXEMPLES DE CREATE TABLE

### Exemple 1 : Table `users` (Table principale)

```sql
-- ============================================
-- TABLE: users
-- Description: Stocke les informations des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,                        -- CUID unique
  email        TEXT NOT NULL UNIQUE,                    -- Email unique par utilisateur
  passwordHash TEXT NOT NULL,                            -- Hash bcrypt du mot de passe
  createdAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
```

**Caractéristiques :**
- Clé primaire : `id` (TEXT, CUID)
- Contrainte d'unicité : `email` (UNIQUE)
- Contraintes NOT NULL : Toutes les colonnes critiques
- Valeurs par défaut : `CURRENT_TIMESTAMP` pour les dates

---

### Exemple 2 : Table `documents` (Table avec relations)

```sql
-- ============================================
-- TABLE: documents
-- Description: Documents écrits par les utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id           TEXT PRIMARY KEY,                         -- CUID unique
  userId       TEXT NOT NULL,                             -- Propriétaire du document
  title        TEXT NOT NULL,                             -- Titre du document
  content      TEXT NOT NULL,                             -- Contenu textuel
  wordCount    INTEGER NOT NULL DEFAULT 0,                 -- Nombre de mots
  styleId      TEXT NOT NULL,                             -- Style d'écriture appliqué
  version      INTEGER NOT NULL DEFAULT 1,                 -- Numéro de version actuelle
  sortOrder    INTEGER NOT NULL DEFAULT 0,                 -- Ordre d'affichage
  bookId       TEXT,                                       -- Livre parent (optionnel)
  chapterOrder INTEGER,                                    -- Ordre du chapitre dans le livre
  createdAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (userId)  REFERENCES users(id)          ON DELETE CASCADE,
  FOREIGN KEY (styleId) REFERENCES writing_styles(id) ON DELETE RESTRICT,
  FOREIGN KEY (bookId)  REFERENCES books(id)          ON DELETE SET NULL
);

-- Index pour optimiser les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_documents_userId ON documents(userId);
CREATE INDEX IF NOT EXISTS idx_documents_styleId ON documents(styleId);
CREATE INDEX IF NOT EXISTS idx_documents_userId_sortOrder ON documents(userId, sortOrder);
CREATE INDEX IF NOT EXISTS idx_documents_bookId ON documents(bookId);
CREATE INDEX IF NOT EXISTS idx_documents_bookId_chapterOrder ON documents(bookId, chapterOrder);
```

**Caractéristiques :**
- Clés étrangères multiples : `userId`, `styleId`, `bookId`
- Gestion des suppressions : CASCADE, RESTRICT, SET NULL selon le contexte
- Index multiples : Pour optimiser les requêtes fréquentes
- Valeurs par défaut : Pour `wordCount`, `version`, `sortOrder`

---

### Exemple 3 : Table `chat_conversations` (Table avec relations)

```sql
-- ============================================
-- TABLE: chat_conversations
-- Description: Conversations de chat IA liées à un document
-- ============================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id         TEXT PRIMARY KEY,                           -- CUID unique
  documentId TEXT NOT NULL,                               -- Document de la conversation
  userId     TEXT NOT NULL,                               -- Utilisateur participant
  createdAt  DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt  DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (userId)     REFERENCES users(id)     ON DELETE CASCADE
);

-- Index pour optimiser les requêtes par document et utilisateur
CREATE INDEX IF NOT EXISTS idx_chat_conversations_documentId ON chat_conversations(documentId);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_userId ON chat_conversations(userId);
```

**Caractéristiques :**
- Deux clés étrangères : `documentId` et `userId`
- Suppression en cascade : Si le document ou l'utilisateur est supprimé
- Index sur les clés étrangères : Pour optimiser les jointures

---

### Exemple 4 : Table `document_tags` (Table de jointure)

```sql
-- ============================================
-- TABLE: document_tags
-- Description: Table de liaison many-to-many entre documents et tags
-- ============================================
CREATE TABLE IF NOT EXISTS document_tags (
  id         TEXT PRIMARY KEY,                            -- CUID unique
  documentId TEXT NOT NULL,                               -- Document tagué
  tagId      TEXT NOT NULL,                               -- Tag associé

  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId)      REFERENCES tags(id)      ON DELETE CASCADE
);

-- Contrainte d'unicité : un document ne peut pas avoir 2 fois le même tag
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_tags_document_tag ON document_tags(documentId, tagId);
CREATE INDEX IF NOT EXISTS idx_document_tags_documentId ON document_tags(documentId);
CREATE INDEX IF NOT EXISTS idx_document_tags_tagId ON document_tags(tagId);
```

**Caractéristiques :**
- Table de jointure : Pour relation plusieurs-à-plusieurs
- Contrainte d'unicité composite : `(documentId, tagId)` UNIQUE
- Index sur les deux clés étrangères : Pour optimiser les requêtes dans les deux sens

---

### Exemple 5 : Table `document_versions` (Table avec contrainte d'unicité composite)

```sql
-- ============================================
-- TABLE: document_versions
-- Description: Versions historiques des documents (snapshots)
-- ============================================
CREATE TABLE IF NOT EXISTS document_versions (
  id         TEXT PRIMARY KEY,                           -- CUID unique
  documentId TEXT NOT NULL,                               -- Document parent
  version    INTEGER NOT NULL,                             -- Numéro de version
  title      TEXT NOT NULL,                               -- Snapshot du titre
  content    TEXT NOT NULL,                               -- Snapshot du contenu
  wordCount  INTEGER NOT NULL,                             -- Nombre de mots à cette version
  createdAt  DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
);

-- Contrainte d'unicité : un document ne peut pas avoir deux fois la même version
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_versions_document_version 
  ON document_versions(documentId, version);
CREATE INDEX IF NOT EXISTS idx_document_versions_documentId ON document_versions(documentId);
```

**Caractéristiques :**
- Contrainte d'unicité composite : `(documentId, version)` UNIQUE
- Snapshot complet : Conserve le titre, contenu et wordCount à chaque version
- Index sur la clé étrangère : Pour récupérer rapidement toutes les versions d'un document

---

## 🔧 EXEMPLE D'ALTER TABLE POUR LA TABLE `documents`

### Migration : Ajout du soft delete (suppression logique)

Cet exemple illustre une migration typique sur la table `documents` : l'ajout d'une colonne `deletedAt` pour permettre la suppression logique des documents.

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

**Caractéristiques de cette migration :**

- **ALTER TABLE ADD COLUMN** : Ajoute une nouvelle colonne à une table existante
- **Type de colonne** : `DATETIME NULL` (permet les valeurs NULL pour les documents non supprimés)
- **Index simple** : `idx_documents_deletedAt` pour filtrer rapidement les documents supprimés/non supprimés
- **Index composite** : `idx_documents_userId_deletedAt` pour optimiser la requête fréquente "documents actifs d'un utilisateur"
- **Vérifications** : Avant et après la migration pour garantir le succès de l'opération

**Justification technique :**

1. **Soft delete** : Permet de marquer un document comme supprimé sans le supprimer physiquement
2. **Valeur NULL** : Les documents existants ont automatiquement `deletedAt = NULL` (non supprimés)
3. **Index composite** : Optimise les requêtes du type `WHERE userId = ? AND deletedAt IS NULL`
4. **Compatibilité** : Aucune perte de données, migration rétrocompatible

---

## 📝 FORMAT RECOMMANDÉ POUR LE DOSSIER PROJET

### Structure à utiliser dans la Section 5.5.1 :

```markdown
### 5.5.1. Script de création

Le script de création de la base de données permet d'initialiser toutes les tables nécessaires au fonctionnement de l'application Alfred. Ce script SQL est conçu pour SQLite 3 et peut être exécuté directement via la commande `sqlite3` ou via Prisma.

**Exemple de création de table principale :**

```sql
-- TABLE: users
-- Description: Stocke les informations des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
```

**Exemple de création de table avec relations :**

```sql
-- TABLE: documents
-- Description: Documents écrits par les utilisateurs
CREATE TABLE IF NOT EXISTS documents (
  id           TEXT PRIMARY KEY,
  userId       TEXT NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  wordCount    INTEGER NOT NULL DEFAULT 0,
  styleId      TEXT NOT NULL,
  version      INTEGER NOT NULL DEFAULT 1,
  sortOrder    INTEGER NOT NULL DEFAULT 0,
  bookId       TEXT,
  chapterOrder INTEGER,
  createdAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt    DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (userId)  REFERENCES users(id)          ON DELETE CASCADE,
  FOREIGN KEY (styleId) REFERENCES writing_styles(id) ON DELETE RESTRICT,
  FOREIGN KEY (bookId)  REFERENCES books(id)          ON DELETE SET NULL
);
```

**Exemple de table de jointure :**

```sql
-- TABLE: document_tags
-- Description: Table de liaison many-to-many entre documents et tags
CREATE TABLE IF NOT EXISTS document_tags (
  id         TEXT PRIMARY KEY,
  documentId TEXT NOT NULL,
  tagId      TEXT NOT NULL,

  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId)      REFERENCES tags(id)      ON DELETE CASCADE
);

-- Contrainte d'unicité composite
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_tags_document_tag 
  ON document_tags(documentId, tagId);
```
```

---

## 📝 FORMAT RECOMMANDÉ POUR ALTER TABLE (Section 5.5.3)

### Structure à utiliser dans la Section 5.5.3 - Script de modification :

```markdown
### 5.5.3. Script de modification

Ce script illustre une migration typique : l'ajout d'une colonne `deletedAt` pour le soft delete (suppression logique) sur la table `documents`.

**Exemple d'ALTER TABLE :**

```sql
-- Migration: Ajout du soft delete sur les documents
-- Date: 2025-01-28

-- Activation des clés étrangères
PRAGMA foreign_keys = ON;

-- Ajouter la colonne deletedAt à la table documents
ALTER TABLE documents ADD COLUMN deletedAt DATETIME NULL;

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_documents_deletedAt ON documents(deletedAt);
CREATE INDEX IF NOT EXISTS idx_documents_userId_deletedAt ON documents(userId, deletedAt);
```

**Objectif de la migration :**
- Permet la suppression logique des documents (soft delete)
- Les documents supprimés ont `deletedAt` non NULL
- Les documents actifs ont `deletedAt = NULL`

**Justification :**
- Conformité RGPD : possibilité de récupérer les données supprimées
- Récupération d'erreurs : restauration possible sans intervention technique
- Audit et traçabilité : conservation de l'historique des suppressions
```

---

## ✅ CHECKLIST POUR VOTRE DOCUMENT

### Section 5.5.1 - Script de création :
- [ ] Inclure au moins 3 exemples de CREATE TABLE :
  - [ ] Une table simple (ex: `users`)
  - [ ] Une table avec relations (ex: `documents`)
  - [ ] Une table de jointure (ex: `document_tags`)
- [ ] Mentionner le SGBD utilisé (SQLite 3)
- [ ] Expliquer les choix techniques (CUID, types de données, contraintes)
- [ ] Mentionner les index créés
- [ ] Expliquer les règles de suppression (CASCADE, RESTRICT, SET NULL)

### Section 5.5.3 - Script de modification :
- [ ] Inclure l'exemple d'ALTER TABLE pour la table `documents`
- [ ] Expliquer l'objectif de la migration (soft delete)
- [ ] Mentionner les index créés après l'ALTER TABLE
- [ ] Justifier les choix techniques (NULL pour non supprimé, DATETIME pour date)

---

---

## 📚 RÉFÉRENCES

- **Script de création complet :** `scripts/create-database.sql`
- **Script de migration :** `scripts/migration-add-soft-delete.sql`
- **Documentation détaillée :** `docs/scripts-base-de-donnees.md`

---

**Document généré le :** 9 février 2026  
**Dernière mise à jour :** 9 février 2026
