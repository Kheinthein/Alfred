# CARTOGRAPHIE FONCTIONNELLE DE L'APPLICATION
## Alfred - Assistant d'Écriture avec Intelligence Artificielle

**Date :** Janvier 2025

---

## Schéma Détaillé de l'Arborescence

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALFRED - ASSISTANT D'ÉCRITURE                │
│                         Application Web                          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐            ┌────────▼────────┐
            │  Zone Publique  │            │ Zone Privée    │
            │  (Non authent.) │            │ (Authentifiée) │
            └───────┬────────┘            └────────┬────────┘
                    │                               │
    ┌───────────────┼───────────────┐               │
    │               │               │               │
┌───▼───┐    ┌──────▼──────┐  ┌────▼────┐    ┌─────▼──────┐
│   /   │    │   /login    │  │/register│    │/documents │
│ Accueil│    │ Connexion   │  │Inscript.│    │  Liste    │
└───┬───┘    └──────┬──────┘  └────┬────┘    └─────┬──────┘
    │               │               │               │
    │               │               │               │
    │         ┌─────┴─────┐         │               │
    │         │           │         │               │
    │    Succès      Échec │         │               │
    │         │           │         │               │
    │         │      ┌────▼────┐    │               │
    │         │      │ Retour  │    │               │
    │         │      │  /login │    │               │
    │         │      └─────────┘    │               │
    │         │                      │               │
    │    ┌────▼────┐            ┌────▼────┐         │
    │    │/documents│            │/documents│         │
    │    │ (auto)   │            │ (auto)   │         │
    │    └─────┬────┘            └─────┬────┘         │
    │          │                        │              │
    │          │    ┌───────────────────┼──────────────┘
    │          │    │                   │              │
    │          │    │    ┌───────────────▼───────────┐ │
    │          │    │    │  Pages Légales           │ │
    │          │    │    │  (Accessibles depuis      │ │
    │          │    │    │   footer ou modales)      │ │
    │          │    │    │                           │ │
    │          │    │    │  /cgu  → CGU             │ │
    │          │    │    │  /cgv  → CGV             │ │
    │          │    │    │  /mentions-legales       │ │
    │          │    │    └───────────────────────────┘ │
    │          │    │                                   │
    │          └────┴───────────────────────────────────┘
    │          │                        │              │
    │          └──────────┬─────────────┘              │
    │                     │                           │
    │            ┌────────▼────────┐                  │
    │            │ /documents/[id] │                  │
    │            │  Édition Doc    │                  │
    │            │   (Page unique) │                  │
    │            └────────┬─────────┘                  │
    │                     │                           │
    │    ┌────────────────┼────────────────┐         │
    │    │                │                │         │
    │    │    ┌───────────▼───────────┐    │         │
    │    │    │  COMPOSANTS DE LA PAGE │    │         │
    │    │    │   (Non des pages séparées) │         │
    │    │    └───────────┬───────────┘    │         │
    │    │                │                │         │
    │    │    ┌───────────┼───────────┐    │         │
    │    │    │           │           │    │         │
    │    │ ┌──▼───┐  ┌────▼────┐  ┌──▼───┐│         │
    │    │ │Éditeur│  │Analyse  │  │ Chat ││         │
    │    │ │ Texte │  │   IA    │  │  IA  ││         │
    │    │ │(zone) │  │(panel)  │  │(onglet)│         │
    │    │ └───────┘  └────┬────┘  └──────┘│         │
    │    │                  │              │         │
    │    │                  └──────┬───────┘         │
    │    │                         │                 │
    │    │                    ┌────┴────┐           │
    │    │                    │Syntaxe │           │
    │    │                    │ Style  │           │
    │    │                    │Narratif│           │
    │    │                    └─────────┘           │
    │    │                                         │
    │    └───────────────────┬─────────────────────┘
    │                        │
    │                ┌────────▼────────┐
    │                │ Retour /documents│
    │                └─────────────────┘
    │
┌───▼──────────────────────────────────────────────────────────────┐
│                    ROUTES API (Backend)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST   /api/auth/login        → Authentification               │
│  POST   /api/auth/register    → Inscription                    │
│                                                                  │
│  GET    /api/documents         → Liste des documents            │
│  POST   /api/documents        → Créer un document               │
│  GET    /api/documents/[id]   → Récupérer un document          │
│  PUT    /api/documents/[id]   → Modifier un document           │
│  DELETE /api/documents/[id]   → Supprimer un document           │
│  POST   /api/documents/reorder → Réorganiser les documents     │
│                                                                  │
│  POST   /api/ai/analyze       → Analyser un texte              │
│                                                                  │
│  GET    /api/docs             → Documentation API              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Note importante :** Les éléments "Éditeur de texte", "Analyse IA" et "Chat IA" ne sont **pas des pages séparées** mais des **composants intégrés** dans la page d'édition de document (`/documents/[id]`). Ils sont tous accessibles depuis la même URL et coexistent sur la même page.

**Structure des pages :**

- **Pages distinctes** (URLs différentes) :
  - `/` - Page d'accueil
  - `/login` - Page de connexion
  - `/register` - Page d'inscription
  - `/documents` - Page liste des documents
  - `/documents/[id]` - Page édition de document
  - `/cgu` - Conditions Générales d'Utilisation
  - `/cgv` - Conditions Générales de Vente
  - `/mentions-legales` - Mentions légales

- **Composants de la page d'édition** (même URL `/documents/[id]`) :
  - Zone d'édition de texte (composant principal)
  - Panel d'analyse IA (sidebar/panel)
  - Interface de chat IA (onglet ou section du panel)

Ces trois composants sont visibles simultanément sur la page d'édition (sur desktop) ou accessibles via des onglets/drawers (sur mobile/tablette), mais ils ne nécessitent pas de navigation vers d'autres URLs.

- **Modales** (accessibles depuis plusieurs pages) :
  - Modale CGU (peut être affichée lors de l'inscription ou depuis le footer)
  - Modale CGV (peut être affichée lors de l'abonnement premium ou depuis le footer)
  - Modale Mentions légales (accessible depuis le footer)

---

## Description Détaillée des Pages

### 1. Page d'Accueil (/)

**URL :** `/`

**Accès :** Public (non authentifié)

**Éléments de la page :**

```
┌─────────────────────────────────────────┐
│              HEADER                     │
│  [Logo Alfred]                          │
└─────────────────────────────────────────┘
│                                         │
│         ┌───────────────────┐          │
│         │                   │          │
│         │  Titre Principal   │          │
│         │  "Alfred -        │          │
│         │   Assistant       │          │
│         │   d'Écriture IA"  │          │
│         │                   │          │
│         └───────────────────┘          │
│                                         │
│         ┌───────────────────┐          │
│         │   Description     │          │
│         │   du service      │          │
│         └───────────────────┘          │
│                                         │
│    ┌──────────┐    ┌──────────┐        │
│    │ Se       │    │ Créer un │        │
│    │ connecter│    │  compte  │        │
│    └────┬─────┘    └────┬─────┘        │
│         │               │              │
│         └───────┬─────────┘              │
│                 │                        │
│         ┌───────▼───────┐               │
│         │ Documentation │               │
│         │     API       │               │
│         └───────────────┘               │
│                                         │
└─────────────────────────────────────────┘
```

**Description :**

La page d'accueil présente l'application Alfred avec le logo, un titre et une description du service. Elle propose deux boutons principaux pour se connecter ou créer un compte, ainsi qu'un lien vers la documentation API. Le footer contient les liens vers les pages légales (CGU, CGV, Mentions légales). Cette page est accessible sans authentification et sert de point d'entrée pour les nouveaux visiteurs.

---

### 2. Page de Connexion (/login)

**URL :** `/login`

**Accès :** Public (redirection automatique si déjà connecté)

**Éléments de la page :**

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌───────────────────┐          │
│         │   [Logo Alfred]   │          │
│         └───────────────────┘          │
│                                         │
│         ┌───────────────────┐          │
│         │    Connexion      │          │
│         └───────────────────┘          │
│                                         │
│    ┌───────────────────────────┐      │
│    │                           │      │
│    │  Email: [____________]    │      │
│    │                           │      │
│    │  Mot de passe: [______]   │      │
│    │                           │      │
│    │  [Se connecter]          │      │
│    │                           │      │
│    └───────────────────────────┘      │
│                                         │
│    Pas encore de compte ?               │
│    [Créer un compte] → /register       │
│                                         │
└─────────────────────────────────────────┘
```

**Description :**

La page de connexion contient un formulaire simple avec deux champs : email et mot de passe. Le formulaire inclut une validation côté client et serveur. En cas de succès, l'utilisateur est automatiquement redirigé vers la page de liste des documents. En cas d'échec, un message d'erreur est affiché. Un lien permet de rediriger vers la page d'inscription pour les utilisateurs qui n'ont pas encore de compte.

---

### 3. Page d'Inscription (/register)

**URL :** `/register`

**Accès :** Public (redirection automatique si déjà connecté)

**Éléments de la page :**

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌───────────────────┐          │
│         │   [Logo Alfred]   │          │
│         └───────────────────┘          │
│                                         │
│         ┌───────────────────┐          │
│         │    Inscription    │          │
│         └───────────────────┘          │
│                                         │
│    ┌───────────────────────────┐      │
│    │                           │      │
│    │  Email: [____________]    │      │
│    │                           │      │
│    │  Mot de passe: [______]   │      │
│    │                           │      │
│    │  Confirmer: [_________]   │      │
│    │                           │      │
│    │  [Créer un compte]       │      │
│    │                           │      │
│    └───────────────────────────┘      │
│                                         │
│    Déjà un compte ?                    │
│    [Se connecter] → /login            │
│                                         │
└─────────────────────────────────────────┘
```

**Description :**

La page d'inscription contient un formulaire avec les champs email, mot de passe et confirmation de mot de passe. Le formulaire valide le format de l'email, vérifie que le mot de passe respecte les règles de sécurité (minimum 8 caractères avec majuscule, minuscule et chiffre), et s'assure que la confirmation correspond au mot de passe. Après inscription réussie, l'utilisateur est automatiquement connecté et redirigé vers la page de liste des documents. Un lien permet de rediriger vers la page de connexion pour les utilisateurs qui ont déjà un compte. Un lien vers les CGU est également présent dans le formulaire.

---

### 4. Page Liste des Documents (/documents)

**URL :** `/documents`

**Accès :** Privé (authentification requise)

**Éléments de la page :**

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Logo]                    [Recherche]  [Menu Utilisateur]│
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │ Document │  │ Document │  │ Document │      │  │
│  │  │   1      │  │    2     │  │    3     │      │  │
│  │  │          │  │          │  │          │      │  │
│  │  │ Roman    │  │ Nouvelle │  │ Poésie   │      │  │
│  │  │ 2000 mots│  │ 1500 mots│  │ 500 mots │      │  │
│  │  │ Modifié  │  │ Modifié  │  │ Modifié  │      │  │
│  │  │ il y a   │  │ il y a   │  │ il y a   │      │  │
│  │  │ 2 jours  │  │ 1 semaine│  │ 3 jours  │      │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘      │  │
│  │       │             │             │            │  │
│  │       └─────────────┴─────────────┘            │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  [+ Créer un nouveau document]          │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ Titre: [________________]                │  │  │
│  │  │ Style: [Roman ▼]                        │  │  │
│  │  │ [Créer] [Annuler]                       │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Description :**

La page liste des documents est la page principale de l'application après authentification. Elle affiche la liste des documents de l'utilisateur sous forme de cartes, chacune présentant le titre, le style d'écriture, le nombre de mots et la date de dernière modification. Un bouton permet de créer un nouveau document en saisissant le titre et en sélectionnant un style d'écriture. Une barre de recherche permet de filtrer les documents par titre. Le header contient le logo, la barre de recherche et le menu utilisateur permettant d'accéder au profil ou de se déconnecter. Chaque carte de document est cliquable et redirige vers la page d'édition du document correspondant.

---

### 5. Page Édition de Document (/documents/[id])

**URL :** `/documents/[id]` où `[id]` est l'identifiant unique du document

**Accès :** Privé (authentification requise, vérification propriétaire)

**Éléments de la page :**

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ [Logo]                    [Titre Document]  [Menu Utilisateur]│
└──────────────────────────────────────────────────────────────┘
│                                                              │
│  ┌──────────────────────────┐  ┌─────────────────────────┐ │
│  │                          │  │                         │ │
│  │   ZONE D'ÉDITION         │  │  PANEL ANALYSE IA       │ │
│  │   (Papier ancien)        │  │  (Moderne)              │ │
│  │                          │  │                         │ │
│  │  ┌────────────────────┐  │  │  [Analyse Syntaxe]     │ │
│  │  │                    │  │  │  [Analyse Style]       │ │
│  │  │                    │  │  │  [Progression Narr.]  │ │
│  │  │                    │  │  │                        │ │
│  │  │   Éditeur de       │  │  │  ┌──────────────────┐ │ │
│  │  │   texte avec       │  │  │  │ Résultats        │ │ │
│  │  │   auto-save        │  │  │  │ analyse...        │ │ │
│  │  │                    │  │  │  └──────────────────┘ │ │
│  │  │                    │  │  │                        │ │
│  │  │                    │  │  │  ┌──────────────────┐ │ │
│  │  │                    │  │  │  │ Chat IA          │ │ │
│  │  │                    │  │  │  │                  │ │ │
│  │  │                    │  │  │  │ Messages...      │ │ │
│  │  │                    │  │  │  │                  │ │ │
│  │  │                    │  │  │  │ [Message...] [>] │ │ │
│  │  │                    │  │  │  └──────────────────┘ │ │
│  │  │                    │  │  │                        │ │
│  │  └────────────────────┘  │  │                         │ │
│  │                          │  │                         │ │
│  │  [Sauvegarde auto ✓]     │  │                         │ │
│  │                          │  │                         │ │
│  └──────────────────────────┘  └─────────────────────────┘ │
│                                                              │
│  [← Retour à la liste]                                       │
└──────────────────────────────────────────────────────────────┘
```

**Description :**

La page d'édition de document est la page de travail principale de l'application. Elle est divisée en deux zones principales : la zone d'édition à gauche avec l'éditeur de texte au thème "papier ancien", et le panel d'analyse IA à droite. L'éditeur de texte inclut une sauvegarde automatique toutes les 2 secondes d'inactivité, avec un indicateur visuel pour rassurer l'utilisateur. Le système de versioning conserve automatiquement un historique des modifications.

Le panel d'analyse IA propose trois types d'analyses : analyse syntaxique pour détecter les erreurs grammaticales, analyse de style pour améliorer le style d'écriture, et analyse de progression narrative pour faire avancer l'histoire. Les résultats sont affichés dans une zone dédiée avec des suggestions détaillées. Un onglet ou une section permet d'accéder au chat avec l'assistant IA pour obtenir des conseils personnalisés basés sur le contenu du document. Un bouton de retour permet de revenir à la liste des documents.

---

### 6. Page Conditions Générales d'Utilisation (/cgu)

**URL :** `/cgu`

**Accès :** Public (accessible depuis toutes les pages)

**Éléments de la page :**

```
┌─────────────────────────────────────────┐
│ HEADER                                   │
│ [Logo]                    [Menu]        │
└─────────────────────────────────────────┘
│                                         │
│    ┌─────────────────────────────┐    │
│    │                             │    │
│    │  Conditions Générales      │    │
│    │  d'Utilisation             │    │
│    │                             │    │
│    │  [Contenu des CGU...]       │    │
│    │                             │    │
│    │  • Article 1 : Objet       │    │
│    │  • Article 2 : Acceptation │    │
│    │  • Article 3 : Compte      │    │
│    │  • Article 4 : Services   │    │
│    │  • Article 5 : Données     │    │
│    │  • Article 6 : Responsab.  │    │
│    │  • Article 7 : Modifications│    │
│    │                             │    │
│    └─────────────────────────────┘    │
│                                         │
│  [Retour]                               │
└─────────────────────────────────────────┘
```

**Description :**

La page des Conditions Générales d'Utilisation affiche le contenu des CGU structuré en articles. Elle est accessible depuis le footer de toutes les pages de l'application. Elle peut également être affichée en modale lors de l'inscription, avec une case à cocher pour accepter les CGU. Le contenu couvre les règles d'utilisation du service, les droits et obligations des utilisateurs, et les conditions d'accès à l'application.

---

### 7. Page Conditions Générales de Vente (/cgv)

**URL :** `/cgv`

**Accès :** Public (accessible depuis toutes les pages)

**Éléments de la page :**

```
┌─────────────────────────────────────────┐
│ HEADER                                   │
│ [Logo]                    [Menu]        │
└─────────────────────────────────────────┘
│                                         │
│    ┌─────────────────────────────┐    │
│    │                             │    │
│    │  Conditions Générales      │    │
│    │  de Vente                 │    │
│    │                             │    │
│    │  [Contenu des CGV...]      │    │
│    │                             │    │
│    │  • Article 1 : Objet       │    │
│    │  • Article 2 : Tarifs      │    │
│    │  • Article 3 : Abonnements │    │
│    │  • Article 4 : Paiement    │    │
│    │  • Article 5 : Résiliation │    │
│    │  • Article 6 : Remboursement│    │
│    │                             │    │
│    └─────────────────────────────┘    │
│                                         │
│  [Retour]                               │
└─────────────────────────────────────────┘
```

**Description :**

La page des Conditions Générales de Vente affiche le contenu des CGV structuré en articles concernant les abonnements premium. Elle est accessible depuis le footer de toutes les pages et peut être affichée en modale lors de l'abonnement premium. Le contenu couvre les tarifs, les modalités de paiement, les conditions de résiliation et de remboursement pour les abonnements premium.

---

### 8. Page Mentions Légales (/mentions-legales)

**URL :** `/mentions-legales`

**Accès :** Public (accessible depuis toutes les pages)

**Éléments de la page :**

```
┌─────────────────────────────────────────┐
│ HEADER                                   │
│ [Logo]                    [Menu]        │
└─────────────────────────────────────────┘
│                                         │
│    ┌─────────────────────────────┐    │
│    │                             │    │
│    │  Mentions Légales           │    │
│    │                             │    │
│    │  [Contenu...]               │    │
│    │                             │    │
│    │  • Éditeur                  │    │
│    │  • Hébergeur                │    │
│    │  • Directeur de publication │    │
│    │  • Protection des données   │    │
│    │  • Cookies                  │    │
│    │                             │    │
│    └─────────────────────────────┘    │
│                                         │
│  [Retour]                               │
└─────────────────────────────────────────┘
```

**Description :**

La page des Mentions légales affiche les informations légales obligatoires concernant l'éditeur, l'hébergeur, le directeur de publication, ainsi que les informations sur la protection des données et les cookies. Elle est accessible depuis le footer de toutes les pages de l'application et répond aux obligations légales en matière d'information des utilisateurs.

---

## Flux de Navigation Principal

```
                    ┌─────────────┐
                    │   Accueil    │
                    │      (/)     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐   ┌─────▼─────┐   ┌────▼────┐
  │ Connexion │   │Inscription│   │API Docs │
  │  /login   │   │ /register │   │/api/docs│
  └─────┬─────┘   └─────┬─────┘   └─────────┘
        │               │
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │   Documents   │
        │  /documents   │
        └───────┬───────┘
                │
        ┌───────▼───────────┐
        │ Édition Document │
        │ /documents/[id]  │
        │                  │
        │  ┌─────────────┐ │
        │  │ Composants │ │
        │  │ sur même   │ │
        │  │   page :   │ │
        │  │            │ │
        │  │ • Éditeur  │ │
        │  │ • Analyse  │ │
        │  │ • Chat IA  │ │
        │  └─────────────┘ │
        └───────┬───────────┘
                │
        ┌───────▼───────┐
        │   Documents   │
        │  (retour)     │
        └───────────────┘

        ┌───────────────────────────────┐
        │  Pages Légales (Footer)      │
        │  Accessibles depuis toutes    │
        │  les pages                    │
        │                               │
        │  ┌──────┐  ┌──────┐  ┌─────┐│
        │  │ CGU  │  │ CGV  │  │Ment.││
        │  │ /cgu │  │ /cgv │  │leg. ││
        │  └──────┘  └──────┘  └─────┘│
        └───────────────────────────────┘
```

**Note :** La page d'édition (`/documents/[id]`) contient simultanément les trois composants (Éditeur, Analyse IA, Chat IA) sur la même page. Ce ne sont pas des pages séparées mais des zones/panels de la même interface.

**Pages légales :** Les pages CGU, CGV et Mentions légales sont accessibles depuis le footer de toutes les pages de l'application. Elles peuvent également être affichées en modale lors de l'inscription (CGU) ou de l'abonnement premium (CGV).

---

## Responsive Design

### Desktop (> 1024px)
- Layout 2 colonnes pour page édition
- Grille 3 colonnes pour liste documents
- Panel IA toujours visible
- Header fixe en haut

### Tablette (768px - 1024px)
- Layout 2 colonnes pour page édition avec drawer pour panel IA
- Grille 2 colonnes pour liste documents
- Boutons adaptés au toucher
- Header adaptatif

### Mobile (< 768px)
- Layout vertical empilé
- Liste verticale pour documents
- Modal plein écran pour panel IA
- Menu hamburger pour navigation
- Champs de formulaire optimisés tactile

---

**Document rédigé le :** Janvier 2025
