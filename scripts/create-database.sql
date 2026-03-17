-- ============================================
-- Script de Création de la Base de Données
-- Application: Alfred - Assistant d'écriture IA
-- SGBD: SQLite 3
-- Date: 2025-01-28
-- ============================================

-- Activation des clés étrangères (obligatoire pour SQLite)
PRAGMA foreign_keys = ON;

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

-- ============================================
-- TABLE: writing_styles
-- Description: Styles d'écriture disponibles (ex: formel, créatif, technique)
-- ============================================
CREATE TABLE IF NOT EXISTS writing_styles (
  id          TEXT PRIMARY KEY,                          -- CUID unique
  name        TEXT NOT NULL UNIQUE,                      -- Nom unique du style
  description TEXT NOT NULL,                              -- Description du style
  createdAt   DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- ============================================
-- TABLE: books
-- Description: Livres contenant plusieurs documents (chapitres)
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id          TEXT PRIMARY KEY,                          -- CUID unique
  userId      TEXT NOT NULL,                             -- Propriétaire du livre
  title       TEXT NOT NULL,                              -- Titre du livre
  description TEXT,                                       -- Description optionnelle
  sortOrder   INTEGER NOT NULL DEFAULT 0,                 -- Ordre d'affichage
  createdAt   DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt   DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_books_userId ON books(userId);
CREATE INDEX IF NOT EXISTS idx_books_userId_sortOrder ON books(userId, sortOrder);

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

-- ============================================
-- TABLE: tags
-- Description: Tags pour catégoriser les documents
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id        TEXT PRIMARY KEY,                            -- CUID unique
  userId    TEXT,                                         -- Propriétaire (NULL = tag système/global)
  name      TEXT NOT NULL,                                -- Nom du tag
  color     TEXT,                                         -- Couleur hexadécimale pour l'UI
  createdAt DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Contrainte d'unicité : un utilisateur ne peut pas avoir 2 tags avec le même nom
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_user_name ON tags(userId, name);
CREATE INDEX IF NOT EXISTS idx_tags_userId ON tags(userId);

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

-- ============================================
-- TABLE: document_templates
-- Description: Modèles de documents réutilisables
-- ============================================
CREATE TABLE IF NOT EXISTS document_templates (
  id          TEXT PRIMARY KEY,                           -- CUID unique
  userId      TEXT,                                       -- Propriétaire (NULL = template système/public)
  styleId     TEXT NOT NULL,                              -- Style d'écriture associé
  name        TEXT NOT NULL,                              -- Nom du template
  description TEXT,                                       -- Description optionnelle
  content     TEXT NOT NULL,                             -- Contenu du template
  isPublic    INTEGER NOT NULL DEFAULT 0,                  -- 0 = privé, 1 = public
  createdAt   DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updatedAt   DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (userId)  REFERENCES users(id)          ON DELETE CASCADE,
  FOREIGN KEY (styleId) REFERENCES writing_styles(id) ON DELETE RESTRICT
);

-- Index pour optimiser les recherches de templates
CREATE INDEX IF NOT EXISTS idx_document_templates_styleId ON document_templates(styleId);
CREATE INDEX IF NOT EXISTS idx_document_templates_userId ON document_templates(userId);
CREATE INDEX IF NOT EXISTS idx_document_templates_isPublic ON document_templates(isPublic);

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

-- ============================================
-- TABLE: chat_messages
-- Description: Messages individuels dans une conversation
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id             TEXT PRIMARY KEY,                        -- CUID unique
  conversationId TEXT NOT NULL,                           -- Conversation parente
  role           TEXT NOT NULL,                           -- "user" | "assistant"
  content        TEXT NOT NULL,                           -- Contenu du message
  createdAt      DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (conversationId) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

-- Index pour optimiser le tri chronologique des messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversationId ON chat_messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversationId_createdAt ON chat_messages(conversationId, createdAt);

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
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_versions_document_version ON document_versions(documentId, version);
CREATE INDEX IF NOT EXISTS idx_document_versions_documentId ON document_versions(documentId);

-- ============================================
-- TABLE: ai_analyses
-- Description: Analyses IA générées pour les documents
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analyses (
  id         TEXT PRIMARY KEY,                           -- CUID unique
  documentId TEXT NOT NULL,                               -- Document analysé
  type       TEXT NOT NULL,                               -- "syntax" | "style" | "progression"
  suggestions TEXT NOT NULL,                              -- Suggestions JSON (tableau)
  confidence REAL NOT NULL,                                -- Niveau de confiance (0.0 à 1.0)
  metadata   TEXT,                                        -- Métadonnées JSON optionnelles
  createdAt  DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes par document
CREATE INDEX IF NOT EXISTS idx_ai_analyses_documentId ON ai_analyses(documentId);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
