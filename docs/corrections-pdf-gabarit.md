# Corrections à Apporter au PDF Gabarit Dossier Projet

**Date :** 9 février 2026  
**Projet :** Alfred - Assistant d'Écriture avec IA  
**Objectif :** Document de référence pour mettre à jour le PDF avec les corrections identifiées

---

## 📋 Instructions d'Utilisation

Ce document liste toutes les corrections à apporter au PDF gabarit. Chaque correction est référencée par :
- **Section** : Section du PDF concernée
- **Ligne approximative** : Position dans le PDF (basée sur l'extraction texte)
- **Texte actuel** : Ce qui est écrit dans le PDF
- **Texte corrigé** : Ce qui doit être écrit

---

## 🔧 CORRECTIONS À APPORTER

### Correction 1 : Nombre de Points d'Accès API

**📍 Section :** 2.1. Description de l'existant  
**📍 Ligne approximative :** 392  
**📍 Contexte :** Description de l'état actuel de l'application

#### ❌ Texte Actuel
```
L'application compte environ 130 tests automatisés avec un taux de couverture d'environ 80 % sur la couche métier. L'API compte 8 points d'accès pour les différentes fonctionnalités. L'interface utilisateur comprend 5 pages principales. Le code est organisé en 3 modules métier pour faciliter la maintenance.
```

#### ✅ Texte Corrigé
```
L'application compte environ 130 tests automatisés avec un taux de couverture d'environ 80 % sur la couche métier. L'API compte 16 points d'accès pour les différentes fonctionnalités (authentification, gestion des documents, gestion des livres, analyses IA, styles d'écriture, documentation). L'interface utilisateur comprend 10 pages principales (accueil, authentification, documents, livres, pages légales). Le code est organisé en 3 modules métier pour faciliter la maintenance.
```

**🔍 Justification :**
- **Endpoints API réels :** 16 endpoints (8 mentionnés dans le PDF)
  - Authentification : `/api/auth/register`, `/api/auth/login`
  - Documents : `/api/documents`, `/api/documents/[id]`, `/api/documents/reorder`, `/api/documents/[id]/move-to-book`
  - Livres : `/api/books`, `/api/books/[id]`, `/api/books/reorder`
  - IA : `/api/ai/analyze`
  - Styles : `/api/styles`
  - Documentation : `/api/docs`
- **Pages réelles :** 10 pages (5 mentionnées dans le PDF)
  - Pages publiques : `/`, `/login`, `/register`
  - Pages authentifiées : `/documents`, `/documents/[id]`, `/books`, `/books/[id]`
  - Pages légales : `/cgu`, `/cgv`, `/mentions-legales`

---

### Correction 2 : Version Next.js

**📍 Section :** 5.2. Architecture Logicielle du Projet  
**📍 Ligne approximative :** 1099  
**📍 Contexte :** Description de la couche Presentation

#### ❌ Texte Actuel
```
La couche Presentation est implémentée avec Next.js 14 (App Router). Elle regroupe les pages de l'interface utilisateur et les API routes (/api/auth, /api/documents, /api/ai).
```

#### ✅ Texte Corrigé
```
La couche Presentation est implémentée avec Next.js 15 (App Router). Elle regroupe les pages de l'interface utilisateur et les API routes (/api/auth, /api/documents, /api/books, /api/ai, /api/styles, /api/docs).
```

**🔍 Justification :**
- Le fichier `package.json` indique : `"next": "15.1.3"`
- Next.js 15 est une version majeure avec des améliorations significatives par rapport à Next.js 14
- Ajout des routes API manquantes dans la liste

---

### Correction 3 : Nombre de Tables dans la Base de Données

**📍 Section :** 5.5. Script de création et/ou de modification de la base de données  
**📍 Sous-section :** 5.5.1. Script de création  
**📍 Ligne approximative :** 1221  
**📍 Contexte :** Description du script de création

#### ❌ Texte Actuel
```
Le script de création de la base de données permet d'initialiser toutes les tables nécessaires au fonctionnement de l'application Alfred. Ce script SQL est conçu pour SQLite 3 et peut être exécuté directement via la commande `sqlite3` ou via Prisma.

Le script crée 10 tables principales :
- users : gestion des utilisateurs
- writing_styles : styles d'écriture disponibles
- books : livres contenant des documents
- documents : documents écrits par les utilisateurs
- tags : tags pour catégoriser les documents
- document_tags : table de liaison documents-tags
- document_templates : modèles de documents réutilisables
- chat_conversations : conversations de chat IA
- chat_messages : messages individuels
- document_versions : versions historiques des documents
- ai_analyses : analyses IA générées
```

#### ✅ Texte Corrigé
```
Le script de création de la base de données permet d'initialiser toutes les tables nécessaires au fonctionnement de l'application Alfred. Ce script SQL est conçu pour SQLite 3 et peut être exécuté directement via la commande `sqlite3` ou via Prisma.

Le script crée 11 tables principales :
- users : gestion des utilisateurs
- writing_styles : styles d'écriture disponibles
- books : livres contenant des documents
- documents : documents écrits par les utilisateurs
- tags : tags pour catégoriser les documents
- document_tags : table de liaison documents-tags
- document_templates : modèles de documents réutilisables
- chat_conversations : conversations de chat IA
- chat_messages : messages individuels
- document_versions : versions historiques des documents
- ai_analyses : analyses IA générées
```

**🔍 Justification :**
- Le schéma Prisma (`prisma/schema.prisma`) contient exactement **11 modèles** (tables)
- Le PDF mentionne "10 tables principales" mais en liste 11, ce qui crée une incohérence
- Correction : "11 tables principales" pour correspondre à la liste

---

### Correction 4 : Liste Complète des Routes API

**📍 Section :** 5.2. Architecture Logicielle du Projet  
**📍 Ligne approximative :** 1100-1101  
**📍 Contexte :** Description des routes API

#### ❌ Texte Actuel
```
Elle regroupe les pages de l'interface utilisateur et les API routes (/api/auth, /api/documents, /api/ai).
```

#### ✅ Texte Corrigé
```
Elle regroupe les pages de l'interface utilisateur et les API routes :
- Authentification : /api/auth/login, /api/auth/register
- Documents : /api/documents, /api/documents/[id], /api/documents/reorder, /api/documents/[id]/move-to-book
- Livres : /api/books, /api/books/[id], /api/books/reorder
- Intelligence Artificielle : /api/ai/analyze
- Styles d'écriture : /api/styles
- Documentation : /api/docs
```

**🔍 Justification :**
- Liste complète et détaillée de tous les endpoints API
- Organisation par catégorie pour plus de clarté
- Correspondance exacte avec la structure réelle du code

---

### Correction 5 : Liste Complète des Pages

**📍 Section :** 5.3. Maquettes et enchainement des maquettes  
**📍 Sous-section :** 5.3.1. Cartographie  
**📍 Ligne approximative :** 1160-1176  
**📍 Contexte :** Description de la cartographie de l'application

#### ❌ Texte Actuel (si présent)
```
[Description simplifiée avec seulement 5 pages]
```

#### ✅ Texte Corrigé (à ajouter ou compléter)
```
L'application Alfred suit une structure hiérarchique organisée autour de deux zones principales : la zone d'authentification et la zone d'application.

**Pages publiques :**
- Page d'accueil (/) : Présentation de l'application, liens vers connexion/inscription
- Page de connexion (/login) : Formulaire d'authentification
- Page d'inscription (/register) : Formulaire de création de compte

**Pages authentifiées :**
- Page liste des documents (/documents) : Affichage et gestion des documents
- Page édition de document (/documents/[id]) : Éditeur de texte avec panel IA
- Page liste des livres (/books) : Affichage et gestion des livres
- Page détail d'un livre (/books/[id]) : Consultation et gestion des chapitres d'un livre

**Pages légales :**
- Conditions Générales d'Utilisation (/cgu)
- Conditions Générales de Vente (/cgv)
- Mentions légales (/mentions-legales)
```

**🔍 Justification :**
- Liste complète de toutes les pages de l'application
- Organisation logique par catégorie
- Correspondance exacte avec la structure réelle du code

### Correction 6 : Diagramme UML - Classes ChatConversation et ChatMessage Manquantes

**📍 Section :** 5.4.4. Diagramme de classes (UML)  
**📍 Contexte :** Représentation des entités et relations

#### ⚠️ Observation Importante

Le diagramme UML de classes dans le PDF ne représente **pas** les classes `ChatConversation` et `ChatMessage` qui existent pourtant dans le schéma de base de données.

#### ✅ Situation Actuelle

**Dans le code :**
- ✅ La table `ChatConversation` existe dans le schéma Prisma (`prisma/schema.prisma` lignes 101-115)
- ✅ La table `ChatMessage` existe dans le schéma Prisma (`prisma/schema.prisma` lignes 117-128)
- ✅ Elles sont documentées dans les diagrammes MERISE (MCD, MLD, MPD)
- ✅ Elles sont mentionnées dans la liste des 11 tables

**Structure réelle :**
```
User (1) ──< (N) ChatConversation (1) ──< (N) ChatMessage
Document (1) ──< (N) ChatConversation
```

**Dans le diagramme UML :**
- ❌ La classe `ChatConversation` n'est pas représentée
- ❌ La classe `ChatMessage` n'est pas représentée
- ⚠️ Ces entités sont absentes du diagramme UML de classes

#### ✅ Recommandation

**Ajouter les classes manquantes au diagramme UML :**

```plantuml
class ChatConversation <<Entity>> {
    --
    -id: string {readonly}
    -documentId: string {readonly}
    -userId: string {readonly}
    -createdAt: Date {readonly}
    -updatedAt: Date
    --
    +validate(): void
}

class ChatMessage <<Entity>> {
    --
    -id: string {readonly}
    -conversationId: string {readonly}
    -role: string {readonly}  // "user" | "assistant"
    -content: string {readonly}
    -createdAt: Date {readonly}
    --
    +validate(): void
}

' Relations
User "1" -- "*" ChatConversation : possède
Document "1" -- "*" ChatConversation : a
ChatConversation "1" -- "*" ChatMessage : contient
```

#### 🔍 Justification

- **Architecture réelle** : Le système utilise une structure à deux niveaux :
  - `ChatConversation` : Regroupe les messages d'une conversation liée à un document
  - `ChatMessage` : Messages individuels dans une conversation
- **Cohérence** : Si le PDF mentionne 11 tables dans la section 5.5, le diagramme UML devrait les représenter toutes
- **Fonctionnalité importante** : Le chat IA est une fonctionnalité majeure de l'application, elle mérite d'être représentée dans le diagramme

---

### Correction 7 : Diagramme UML - Table de Jointure DocumentTag

**📍 Section :** 5.4.4. Diagramme de classes (UML)  
**📍 Contexte :** Représentation des entités et relations

#### ⚠️ Observation Importante

Le diagramme UML de classes dans le PDF (et dans `docs/diagramme-classes-uml.puml`) ne représente **pas explicitement** la classe `DocumentTag` qui est pourtant nécessaire pour la relation plusieurs-à-plusieurs entre `Document` et `Tag`.

#### ✅ Situation Actuelle

**Dans le code :**
- ✅ La table `DocumentTag` existe bien dans le schéma Prisma (`prisma/schema.prisma`)
- ✅ Elle est documentée dans les diagrammes MERISE (MCD, MLD, MPD)
- ✅ Elle est mentionnée dans la liste des tables (11 tables)

**Dans le diagramme UML :**
- ❌ La classe `DocumentTag` n'est pas représentée comme une classe séparée
- ❌ La classe `Tag` n'est pas non plus représentée dans le diagramme UML de classes
- ⚠️ La relation Document-Tag est représentée comme une relation plusieurs-à-plusieurs sans table de jointure explicite

#### ✅ Recommandation

**Option 1 : Ajouter les classes manquantes au diagramme UML**

Si le diagramme UML doit représenter la structure complète de la base de données, ajouter :

```plantuml
class Tag <<Entity>> {
    --
    -id: string {readonly}
    -name: string
    -color: string | null
    -userId: string | null
    -createdAt: Date {readonly}
    --
    +validate(): void
}

class DocumentTag <<Entity>> {
    --
    -id: string {readonly}
    -documentId: string {readonly}
    -tagId: string {readonly}
    --
    +validate(): void
}

' Relations
Document "1" -- "*" DocumentTag : est tagué
Tag "1" -- "*" DocumentTag : est associé à
```

**Option 2 : Clarifier la portée du diagramme**

Si le diagramme UML représente uniquement le **modèle métier** (Domain Layer) et non le modèle de données complet, ajouter une note explicative :

> **Note :** Ce diagramme représente les entités métier principales. Les entités de gestion comme `Tag` et `DocumentTag` sont documentées dans les diagrammes MERISE (MCD, MLD, MPD) qui représentent le modèle de données complet.

#### 🔍 Justification

- **Dans une base de données relationnelle**, une relation plusieurs-à-plusieurs nécessite une **table de jointure**
- **Dans un diagramme UML de classes**, on peut représenter cette table de jointure comme une classe séparée pour plus de clarté
- **Cohérence** : Si le PDF mentionne 11 tables dans la section 5.5, le diagramme UML devrait les représenter toutes, ou au moins mentionner celles qui sont omises

---

## 📊 TABLEAU RÉCAPITULATIF DES CORRECTIONS

| # | Section | Ligne Approx. | Élément | Avant | Après | Priorité |
|---|---------|---------------|---------|-------|--------|----------|
| 1 | 2.1 | 392 | Endpoints API | 8 | 16 | 🔴 Haute |
| 2 | 2.1 | 393 | Pages principales | 5 | 10 | 🔴 Haute |
| 3 | 5.2 | 1099 | Version Next.js | 14 | 15 | 🔴 Haute |
| 4 | 5.5.1 | 1221 | Nombre de tables | 10 | 11 | 🟡 Moyenne |
| 5 | 5.2 | 1100 | Liste routes API | Incomplète | Complète | 🟡 Moyenne |
| 6 | 5.3.1 | 1160 | Liste pages | Incomplète | Complète | 🟡 Moyenne |
| 7 | 5.4.4 | - | Diagramme UML ChatConversation/ChatMessage | Manquantes | À ajouter | 🔴 Haute |
| 8 | 5.4.4 | - | Diagramme UML DocumentTag | Manquante | À ajouter | 🟡 Moyenne |

---

## ✅ VÉRIFICATIONS À EFFECTUER APRÈS CORRECTION

Après avoir appliqué ces corrections, vérifier que :

1. ✅ Le nombre d'endpoints API (16) correspond à la liste détaillée
2. ✅ Le nombre de pages (10) correspond à la liste détaillée
3. ✅ La version Next.js (15) est cohérente dans tout le document
4. ✅ Le nombre de tables (11) correspond à la liste détaillée
5. ✅ Toutes les routes API sont mentionnées dans la section architecture
6. ✅ Toutes les pages sont mentionnées dans la section cartographie

---

## 📝 NOTES IMPORTANTES

### Cohérence du Document

Après ces corrections, il est important de vérifier la cohérence dans tout le document :

- Si la section 2.1 mentionne "16 endpoints", toutes les autres sections doivent être cohérentes
- Si la section 5.2 mentionne "Next.js 15", toutes les autres références doivent être mises à jour
- Si la section 5.5 mentionne "11 tables", toutes les autres références doivent être cohérentes

### Sections à Vérifier pour Cohérence

1. **Section 1** (Compétences) : Vérifier que les outils mentionnés correspondent (Next.js 15, etc.)
2. **Section 6** (Spécifications techniques) : Vérifier que l'environnement technique mentionne Next.js 15
3. **Section 7** (Réalisations) : Vérifier que les exemples de code mentionnent les bonnes versions
4. **Section 9** (Plan de tests) : Vérifier que les tests couvrent bien les 16 endpoints

---

## 🎯 CHECKLIST DE MISE À JOUR

Avant de finaliser le PDF, cocher chaque élément :

- [ ] Correction 1 : Nombre d'endpoints API (8 → 16)
- [ ] Correction 2 : Nombre de pages (5 → 10)
- [ ] Correction 3 : Version Next.js (14 → 15)
- [ ] Correction 4 : Nombre de tables (10 → 11)
- [ ] Correction 5 : Liste complète des routes API
- [ ] Correction 6 : Liste complète des pages
- [ ] Correction 7 : Ajouter ChatConversation et ChatMessage au diagramme UML
- [ ] Correction 8 : Ajouter DocumentTag et Tag au diagramme UML (ou note explicative)
- [ ] Vérification de cohérence dans tout le document
- [ ] Vérification des sections 1, 6, 7, 9 pour cohérence
- [ ] Relecture finale du document corrigé

---

## 📎 RÉFÉRENCES TECHNIQUES

Pour vérifier les informations dans le code :

- **Endpoints API :** `src/app/api/**/route.ts`
- **Pages :** `src/app/**/page.tsx`
- **Version Next.js :** `package.json` ligne 62
- **Tables BDD :** `prisma/schema.prisma`
- **Tests :** `tests/**/*.test.ts` et `tests/**/*.spec.ts`
- **Couverture :** `jest.config.js`

---

**Document généré le :** 9 février 2026  
**Dernière mise à jour :** 9 février 2026  
**Statut :** ✅ Prêt pour intégration dans le PDF
