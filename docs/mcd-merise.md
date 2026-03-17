# MCD (Modèle Conceptuel de Données) - MERISE

**Application :** Alfred - Assistant d'écriture IA  
**Date :** 2025-01-13  
**Version :** 2.0 — mise à jour 2026-02-12

---

## Modèle Conceptuel de Données

```mermaid
erDiagram
    USER ||--o{ DOCUMENT : "CRÉE"
    USER ||--o{ BOOK : "POSSÈDE"
    USER ||--o{ CHAT_CONVERSATION : "PARTICIPE"
    USER ||--o{ TAG : "CRÉE"
    USER ||--o{ DOCUMENT_TEMPLATE : "CRÉE"
    
    BOOK ||--o{ DOCUMENT : "CONTIENT"
    
    WRITING_STYLE ||--o{ DOCUMENT : "APPLIQUÉ_À"
    WRITING_STYLE ||--o{ DOCUMENT_TEMPLATE : "UTILISÉ_PAR"
    
    DOCUMENT ||--o{ AI_ANALYSIS : "A"
    DOCUMENT ||--o{ CHAT_CONVERSATION : "A"
    DOCUMENT ||--o{ DOCUMENT_VERSION : "A"
    DOCUMENT ||--o{ DOCUMENT_TAG : "EST_TAGUÉ"
    
    TAG ||--o{ DOCUMENT_TAG : "ASSOCIÉ_À"
    
    CHAT_CONVERSATION ||--o{ CHAT_MESSAGE : "CONTIENT"
    
    USER {
        string id PK
        string email UK
        string name
        string passwordHash
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    
    BOOK {
        string id PK
        string userId FK
        string title
        string description
        bigint sortOrder
        datetime createdAt
        datetime updatedAt
    }
    
    DOCUMENT {
        string id PK
        string userId FK
        string title
        string content
        int wordCount
        string styleId FK
        int version
        bigint sortOrder
        string bookId FK
        int chapterOrder
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    
    WRITING_STYLE {
        string id PK
        string name UK
        string description
        datetime createdAt
    }
    
    TAG {
        string id PK
        string userId FK
        string name
        string color
        datetime createdAt
    }
    
    DOCUMENT_TAG {
        string id PK
        string documentId FK
        string tagId FK
    }
    
    DOCUMENT_TEMPLATE {
        string id PK
        string userId FK
        string styleId FK
        string name
        string description
        string content
        boolean isPublic
        datetime createdAt
        datetime updatedAt
    }
    
    CHAT_CONVERSATION {
        string id PK
        string documentId FK
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    CHAT_MESSAGE {
        string id PK
        string conversationId FK
        string role
        string content
        datetime createdAt
    }
    
    DOCUMENT_VERSION {
        string id PK
        string documentId FK
        int version
        string title
        string content
        int wordCount
        datetime createdAt
    }
    
    AI_ANALYSIS {
        string id PK
        string documentId FK
        string type
        string suggestions
        float confidence
        string metadata
        datetime createdAt
    }
```

---

## Légende

- **PK** : Clé primaire (Primary Key)
- **FK** : Clé étrangère (Foreign Key)
- **UK** : Clé unique (Unique Key)
- **Cardinalités** : (1,n) = Un à plusieurs
