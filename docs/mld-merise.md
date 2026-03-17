# MLD (Modèle Logique de Données) - MERISE

**Application :** Alfred - Assistant d'écriture IA  
**Date :** 2025-01-13  
**Version :** 2.0 — mise à jour 2026-02-12

---

## Modèle Logique de Données

```mermaid
erDiagram
    users ||--o{ documents : "1,n"
    users ||--o{ books : "1,n"
    users ||--o{ chat_conversations : "1,n"
    users ||--o{ tags : "1,n"
    users ||--o{ document_templates : "1,n"
    
    books ||--o{ documents : "1,n"
    
    writing_styles ||--o{ documents : "1,n"
    writing_styles ||--o{ document_templates : "1,n"
    
    documents ||--o{ ai_analyses : "1,n"
    documents ||--o{ chat_conversations : "1,n"
    documents ||--o{ document_versions : "1,n"
    documents ||--o{ document_tags : "1,n"
    
    tags ||--o{ document_tags : "1,n"
    
    chat_conversations ||--o{ chat_messages : "1,n"
    
    users {
        TEXT id PK "CUID, NOT NULL"
        TEXT email UK "NOT NULL"
        TEXT name "NULL"
        TEXT passwordHash "NOT NULL"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME updatedAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME deletedAt "NULL"
    }
    
    books {
        TEXT id PK "CUID, NOT NULL"
        TEXT userId FK "NOT NULL, REFERENCES users(id) ON DELETE CASCADE"
        TEXT title "NOT NULL"
        TEXT description "NULL"
        INTEGER sortOrder "NOT NULL, DEFAULT 0"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME updatedAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
    
    documents {
        TEXT id PK "CUID, NOT NULL"
        TEXT userId FK "NOT NULL, REFERENCES users(id) ON DELETE CASCADE"
        TEXT title "NOT NULL"
        TEXT content "NOT NULL"
        INTEGER wordCount "NOT NULL, DEFAULT 0"
        TEXT styleId FK "NOT NULL, REFERENCES writing_styles(id)"
        INTEGER version "NOT NULL, DEFAULT 1"
        INTEGER sortOrder "NOT NULL, DEFAULT 0"
        TEXT bookId FK "NULL, REFERENCES books(id) ON DELETE SET NULL"
        INTEGER chapterOrder "NULL"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME updatedAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME deletedAt "NULL"
    }
    
    writing_styles {
        TEXT id PK "CUID, NOT NULL"
        TEXT name UK "NOT NULL"
        TEXT description "NOT NULL"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
    
    tags {
        TEXT id PK "CUID, NOT NULL"
        TEXT userId FK "NULL, REFERENCES users(id) ON DELETE CASCADE"
        TEXT name "NOT NULL"
        TEXT color "NULL"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
    
    document_tags {
        TEXT id PK "CUID, NOT NULL"
        TEXT documentId FK "NOT NULL, REFERENCES documents(id) ON DELETE CASCADE"
        TEXT tagId FK "NOT NULL, REFERENCES tags(id) ON DELETE CASCADE"
    }
    
    document_templates {
        TEXT id PK "CUID, NOT NULL"
        TEXT userId FK "NULL, REFERENCES users(id) ON DELETE CASCADE"
        TEXT styleId FK "NOT NULL, REFERENCES writing_styles(id)"
        TEXT name "NOT NULL"
        TEXT description "NULL"
        TEXT content "NOT NULL"
        INTEGER isPublic "NOT NULL, DEFAULT 0"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME updatedAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
    
    chat_conversations {
        TEXT id PK "CUID, NOT NULL"
        TEXT documentId FK "NOT NULL, REFERENCES documents(id) ON DELETE CASCADE"
        TEXT userId FK "NOT NULL, REFERENCES users(id) ON DELETE CASCADE"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
        DATETIME updatedAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
    
    chat_messages {
        TEXT id PK "CUID, NOT NULL"
        TEXT conversationId FK "NOT NULL, REFERENCES chat_conversations(id) ON DELETE CASCADE"
        TEXT role "NOT NULL"
        TEXT content "NOT NULL"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
    
    document_versions {
        TEXT id PK "CUID, NOT NULL"
        TEXT documentId FK "NOT NULL, REFERENCES documents(id) ON DELETE CASCADE"
        INTEGER version "NOT NULL"
        TEXT title "NOT NULL"
        TEXT content "NOT NULL"
        INTEGER wordCount "NOT NULL"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
    
    ai_analyses {
        TEXT id PK "CUID, NOT NULL"
        TEXT documentId FK "NOT NULL, REFERENCES documents(id) ON DELETE CASCADE"
        TEXT type "NOT NULL"
        TEXT suggestions "NOT NULL"
        REAL confidence "NOT NULL"
        TEXT metadata "NULL"
        DATETIME createdAt "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
```

---

## Contraintes d'intégrité

### Contraintes d'unicité (UNIQUE)

- `users.email` : UNIQUE
- `writing_styles.name` : UNIQUE
- `tags(userId, name)` : UNIQUE (contrainte composite)
- `document_tags(documentId, tagId)` : UNIQUE (contrainte composite)
- `document_versions(documentId, version)` : UNIQUE (contrainte composite)

### Suppression logique (soft delete)

- `documents.deletedAt` : NULL = document actif, NOT NULL = document en corbeille
- `users.deletedAt` : NULL = compte actif, NOT NULL = compte supprimé

### Contraintes de clés étrangères (FOREIGN KEY)

- `books.userId` → `users.id` (ON DELETE CASCADE)
- `documents.userId` → `users.id` (ON DELETE CASCADE)
- `documents.styleId` → `writing_styles.id`
- `documents.bookId` → `books.id` (ON DELETE SET NULL)
- `tags.userId` → `users.id` (ON DELETE CASCADE)
- `document_tags.documentId` → `documents.id` (ON DELETE CASCADE)
- `document_tags.tagId` → `tags.id` (ON DELETE CASCADE)
- `document_templates.userId` → `users.id` (ON DELETE CASCADE)
- `document_templates.styleId` → `writing_styles.id`
- `chat_conversations.documentId` → `documents.id` (ON DELETE CASCADE)
- `chat_conversations.userId` → `users.id` (ON DELETE CASCADE)
- `chat_messages.conversationId` → `chat_conversations.id` (ON DELETE CASCADE)
- `document_versions.documentId` → `documents.id` (ON DELETE CASCADE)
- `ai_analyses.documentId` → `documents.id` (ON DELETE CASCADE)

---

## Index

### Index simples

- `books(userId)`
- `books(userId, sortOrder)`
- `documents(userId)`
- `documents(styleId)`
- `documents(userId, sortOrder)`
- `documents(bookId)`
- `documents(bookId, chapterOrder)`
- `documents(deletedAt)`
- `documents(userId, deletedAt)`
- `users(email)`
- `tags(userId)`
- `document_tags(documentId)`
- `document_tags(tagId)`
- `document_templates(styleId)`
- `document_templates(userId)`
- `document_templates(isPublic)`
- `chat_conversations(documentId)`
- `chat_conversations(userId)`
- `chat_messages(conversationId)`
- `chat_messages(conversationId, createdAt)`
- `document_versions(documentId)`
- `document_versions(documentId, version)`
- `ai_analyses(documentId)`

---

## Légende

- **PK** : Clé primaire (Primary Key)
- **FK** : Clé étrangère (Foreign Key)
- **UK** : Clé unique (Unique Key)
- **NOT NULL** : Contrainte de non-nullité
- **NULL** : Valeur optionnelle
- **DEFAULT** : Valeur par défaut
- **ON DELETE CASCADE** : Suppression en cascade
- **ON DELETE SET NULL** : Mise à NULL lors de la suppression
- **CUID** : Collision-resistant Unique Identifier

---

## Notes techniques

### Types de données SQLite

- **TEXT** : Chaîne de caractères (utilisé pour les CUID et textes)
- **INTEGER** : Entier (utilisé pour les nombres entiers)
- **REAL** : Nombre décimal (utilisé pour les floats)
- **DATETIME** : Date et heure (stockée en TEXT dans SQLite)

### Gestion des suppressions

- **CASCADE** : Lors de la suppression d'un enregistrement parent, tous les enregistrements enfants sont supprimés automatiquement
- **SET NULL** : Lors de la suppression d'un enregistrement parent, la clé étrangère dans l'enregistrement enfant est mise à NULL (utilisé pour `documents.bookId`)

### Valeurs par défaut

- Les timestamps (`createdAt`, `updatedAt`) sont générés automatiquement
- Les valeurs numériques (`sortOrder`, `wordCount`, `version`) ont des valeurs par défaut
- Les booléens sont stockés comme INTEGER (0 = false, 1 = true)
