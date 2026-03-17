# SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES
## Alfred - Assistant d'Écriture avec Intelligence Artificielle

**Date :** Janvier 2025

---

## 5. SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES

### 5.1. Contraintes du Projet et Livrables Attendus

#### 5.1.1. Criticité de l'Application

**Criticité de la population qui utilise l'application :**

L’application Alfred s’adresse principalement à des particuliers passionnés d’écriture, qu’ils soient professionnels ou amateurs. La criticité de la population est considérée comme moyenne.
En effet, l’application ne concerne pas la sécurité ou la santé des utilisateurs, et son indisponibilité ne met pas en danger les personnes. Cependant, elle peut constituer un outil professionnel important pour certains écrivains, qui peuvent en dépendre dans le cadre de leur activité.

**Nombre d'utilisateurs :**

Pour la Phase 1 (lancement), l'application vise environ 1000 utilisateurs actifs par mois, avec environ 100 nouveaux utilisateurs par mois. Le nombre d'utilisateurs inscrits est estimé à environ 1500, incluant les utilisateurs actifs et ceux qui ont testé l'application sans l'utiliser régulièrement. Aucun archivage d'utilisateurs n'est prévu dans cette phase.

Pour la Phase 2 (croissance), l'objectif est d'atteindre environ 10000 utilisateurs actifs par mois, avec environ 1000 nouveaux utilisateurs par mois.

**Disponibilité (Key Performance Indicator) :**

L'objectif de disponibilité est fixé à 99.5%, ce qui représente un maximum de 4.4 heures d'indisponibilité par mois. Le temps de récupération après un incident (RTO - Recovery Time Objective) doit être inférieur à 1 heure. Les sauvegardes sont effectuées toutes les 15 minutes maximum pour garantir une perte de données minimale (RPO - Recovery Point Objective).

**Support et maintenance :**

Le support est assuré du lundi au vendredi, de 9h à 18h (5 jours sur 7). Pour les utilisateurs premium, un support prioritaire est disponible avec un temps de réponse garanti inférieur à 4 heures. Les utilisateurs gratuits bénéficient d'un support standard avec un temps de réponse inférieur à 48 heures.

La maintenance préventive est planifiée en dehors des heures de pointe, généralement le dimanche matin entre 2h et 6h. Les utilisateurs sont informés à l'avance des opérations de maintenance prévues.

**Impacts indisponibilité de service :**

En cas d'indisponibilité de l'application, les utilisateurs ne peuvent pas accéder à leurs documents ni utiliser les fonctionnalités d'analyse par intelligence artificielle. Cependant, les données sont sauvegardées régulièrement, ce qui limite le risque de perte de données. L'impact principal concerne la perte de productivité pour les écrivains qui utilisent l'application quotidiennement.

Pour minimiser l'impact, un système de notification est mis en place pour informer les utilisateurs des incidents en cours et des mesures prises pour résoudre le problème.

#### 5.1.2. Applications Connexes

L'application Alfred est une application autonome qui ne dépend pas directement d'autres applications métier de l'entreprise. Cependant, certaines intégrations sont prévues ou envisagées :

**Intégrations prévues :**

Aucune intégration avec d'autres applications métier n'est prévue dans la Phase 1. L'application fonctionne de manière indépendante.

**Intégrations envisagées :**

Pour les phases futures, des intégrations avec d'autres outils d'écriture sont envisagées, notamment avec des logiciels d'édition ou des plateformes de publication. Ces intégrations permettraient d'exporter directement les documents vers ces outils ou d'importer des documents existants.

**Dépendances techniques :**

L'application dépend techniquement de services externes pour l'intelligence artificielle (OpenAI, Claude, ou autres fournisseurs). Ces dépendances sont gérées via des adaptateurs qui permettent de changer de fournisseur sans impact sur le reste de l'application.

#### 5.1.3. Services Tiers

**Services d'intelligence artificielle :**

L'application utilise des services tiers pour les analyses par intelligence artificielle. Les fournisseurs supportés sont OpenAI (GPT-4 Turbo), Claude (Anthropic), et potentiellement d'autres fournisseurs via des adaptateurs. Le choix du fournisseur est configurable via une variable d'environnement.

**Services d'hébergement :**

L'application est hébergée sur une infrastructure cloud. Les services utilisés incluent le stockage de fichiers, la base de données, et le déploiement de l'application. Ces services sont gérés par le responsable d'exploitation.

**Services de monitoring et logging :**

Des services de monitoring sont utilisés pour suivre les performances de l'application et détecter les erreurs. Les logs sont centralisés pour faciliter le débogage et l'analyse des incidents.

**Services non utilisés :**

L'application n'utilise pas actuellement de services d'analytics externes (comme Google Analytics), d'intégration avec les réseaux sociaux, de services d'emailing, ou de CRM. Ces services pourront être intégrés dans les phases futures selon les besoins identifiés.

#### 5.1.4. Livrables Attendus

**Cahier des charges :**

Le cahier des charges détaillé a été fourni et validé par la maîtrise d'ouvrage. Il décrit les besoins fonctionnels, les contraintes techniques, et les objectifs du projet.

**Spécifications fonctionnelles et techniques :**

Le présent document constitue les spécifications fonctionnelles détaillées. Les spécifications techniques décrivent l'architecture technique, les technologies utilisées, et les choix d'implémentation. Ces documents sont validés par la maîtrise d'ouvrage avant le début du développement.

**Maquettage et design :**

Les maquettes de l'interface utilisateur ont été réalisées et validées. La charte graphique, avec son thème "papier ancien" pour la zone d'écriture et moderne pour la partie intelligence artificielle, a été définie et approuvée.

**Développement :**

Le développement de l'application comprend l'implémentation de toutes les fonctionnalités décrites dans le cahier des charges : authentification, gestion des documents, analyses par intelligence artificielle, interface utilisateur, et toutes les fonctionnalités complémentaires.

**Intégration :**

L'intégration comprend la configuration des services externes (intelligence artificielle, base de données), la mise en place de l'environnement de production, et les tests d'intégration pour valider le bon fonctionnement de l'ensemble.

**Migration de base de données :**

Aucune migration de base de données existante n'est nécessaire. La base de données est créée lors du déploiement initial avec les migrations Prisma.

**Achat du nom de domaine et gestion de l'hébergement :**

L'achat du nom de domaine et la gestion de l'hébergement sont assurés par l'entreprise. Le nom de domaine est configuré et pointé vers l'infrastructure d'hébergement.

**Maintenance et mises à jour :**

La maintenance comprend la correction des bugs, l'application des mises à jour de sécurité, et l'amélioration continue de l'application. Les mises à jour sont déployées selon un planning défini, avec notification des utilisateurs pour les mises à jour majeures.

**Formation à la gestion du site :**

Une formation est fournie aux administrateurs pour la gestion de l'application, notamment pour la gestion des utilisateurs, des styles d'écriture, et le monitoring du système.

**Accompagnement marketing :**

L'accompagnement marketing comprend la définition d'un plan marketing, l'optimisation pour les moteurs de recherche (SEO), et l'analyse de l'utilisation de l'application (webanalyse). Le référencement payant (SEA) et l'optimisation des médias sociaux (SMO) pourront être ajoutés dans les phases futures selon les besoins.

### 5.2. Architecture Logicielle du Projet

**Architecture générale :**

L'application Alfred utilise une architecture Clean Architecture organisée en monolithe modulaire. Cette architecture sépare clairement les responsabilités en quatre couches principales : Presentation, Application, Domain, et Infrastructure.

**Couche Presentation :**

La couche Presentation est implémentée avec Next.js 14 utilisant l'App Router. Elle comprend les routes API (`/api/auth`, `/api/documents`, `/api/ai`) qui exposent les fonctionnalités de l'application, et les pages de l'interface utilisateur. Les middlewares gèrent l'authentification, la validation des données, et la gestion des erreurs.

**Couche Application :**

La couche Application orchestre les cas d'usage métier. Elle comprend les DTOs (Data Transfer Objects) avec validation Zod pour valider les données d'entrée, et les services d'orchestration qui coordonnent les interactions entre les différentes couches. L'injection de dépendances est gérée via InversifyJS.

**Couche Domain :**

La couche Domain contient la logique métier pure, indépendante de l'infrastructure. Elle comprend les entités (User, Document, AIAnalysis), les value objects (Email, DocumentContent), les cas d'usage (CreateUser, AnalyzeText, etc.), et les interfaces de repositories (Ports) qui définissent les contrats d'accès aux données.

**Couche Infrastructure :**

La couche Infrastructure implémente les adaptateurs pour les services externes. Elle comprend les implémentations des repositories utilisant Prisma pour l'accès à la base de données, les adaptateurs pour les services d'intelligence artificielle (OpenAI, Claude), le logger Winston, et l'authentification JWT.

**Modules métier :**

L'application est organisée en trois modules métier principaux :

- **User Module** : Gère l'authentification et la gestion des utilisateurs. Il comprend la création de compte, la connexion, la gestion du profil, et l'authentification JWT.

- **Document Module** : Gère la création, la modification, la suppression, et la consultation des documents. Il comprend également le système de versioning qui conserve un historique automatique des modifications.

- **AI Assistant Module** : Gère les analyses par intelligence artificielle (correction syntaxique, analyse de style, suggestions narratives) et le chat avec l'assistant IA. Il utilise des adaptateurs pour communiquer avec les différents fournisseurs d'IA.

**Base de données :**

La base de données utilise SQLite en développement et peut être migrée vers PostgreSQL en production. Le schéma est géré via Prisma ORM, qui permet de définir le modèle de données et de générer les migrations automatiquement.

**Sécurité :**

La sécurité est assurée à plusieurs niveaux : hashage des mots de passe avec bcrypt, authentification JWT avec expiration, validation et nettoyage de toutes les entrées utilisateur, et système de rate limiting pour protéger l'API contre les abus.

**Tests :**

Les tests sont organisés en trois niveaux : tests unitaires pour la logique métier dans la couche Domain, tests d'intégration pour les API routes et l'interaction avec la base de données, et tests end-to-end avec Playwright pour valider les scénarios utilisateur complets.

**Déploiement :**

L'application est conteneurisée avec Docker pour faciliter le déploiement. La configuration Docker inclut l'application Next.js, la base de données, et toutes les dépendances nécessaires. Le déploiement est automatisé via GitHub Actions.

### 5.3. Maquettes et Enchaînement des Maquettes

#### 5.3.1. Cartographie

**Schéma de l'arborescence de l'application :**

L'application Alfred suit une structure hiérarchique simple organisée autour de deux zones principales : la zone d'authentification et la zone d'application.

```
Alfred - Assistant d'Écriture
│
├── Page d'accueil (/)
│   ├── Logo Alfred
│   ├── Titre et description
│   ├── Bouton "Se connecter" → /login
│   ├── Bouton "Créer un compte" → /register
│   └── Lien "Documentation API" → /api/docs
│
├── Zone d'authentification
│   ├── Page de connexion (/login)
│   │   ├── Formulaire de connexion
│   │   ├── Lien vers inscription → /register
│   │   └── Redirection automatique si déjà connecté → /documents
│   │
│   └── Page d'inscription (/register)
│       ├── Formulaire d'inscription
│       ├── Lien vers connexion → /login
│       └── Redirection automatique si déjà connecté → /documents
│
└── Zone d'application (nécessite authentification)
    ├── Page liste des documents (/documents)
    │   ├── Header avec logo et menu utilisateur
    │   ├── Liste des documents (cartes)
    │   ├── Bouton "Créer un document"
    │   ├── Formulaire de création de document
    │   └── Navigation vers document → /documents/[id]
    │
    └── Page édition de document (/documents/[id])
        ├── Header avec logo et menu utilisateur
        ├── Zone d'édition (éditeur de texte)
        ├── Panel d'analyse IA (sidebar)
        ├── Chat avec l'assistant IA
        └── Bouton retour → /documents
```

**Description des pages du site :**

**Page d'accueil (/) :**

La page d'accueil présente l'application Alfred avec le logo, un titre accrocheur, et une description du service. Elle contient trois boutons principaux : "Se connecter" qui redirige vers la page de connexion, "Créer un compte" qui redirige vers la page d'inscription, et un lien vers la documentation API. Cette page est accessible sans authentification et sert de point d'entrée pour les nouveaux visiteurs.

**Page de connexion (/login) :**

La page de connexion contient un formulaire avec deux champs : email et mot de passe. Le formulaire inclut une validation côté client et serveur. Un lien permet de rediriger vers la page d'inscription pour les utilisateurs qui n'ont pas encore de compte. Si l'utilisateur est déjà connecté, il est automatiquement redirigé vers la page de liste des documents.

**Page d'inscription (/register) :**

La page d'inscription contient un formulaire avec les champs email et mot de passe (avec confirmation). Le formulaire inclut une validation pour s'assurer que le mot de passe respecte les critères de sécurité (minimum 8 caractères, majuscule, minuscule, chiffre). Un lien permet de rediriger vers la page de connexion pour les utilisateurs qui ont déjà un compte. Après inscription réussie, l'utilisateur est automatiquement connecté et redirigé vers la page de liste des documents.

**Page liste des documents (/documents) :**

La page liste des documents est la page principale de l'application après authentification. Elle contient un header avec le logo Alfred et un menu utilisateur permettant de se déconnecter. La zone principale affiche la liste des documents sous forme de cartes, chacune affichant le titre, le style d'écriture, le nombre de mots, et la date de dernière modification. Un bouton permet de créer un nouveau document. Un formulaire permet de créer un document en saisissant le titre et en sélectionnant un style d'écriture. Chaque carte de document est cliquable et redirige vers la page d'édition du document correspondant.

**Page édition de document (/documents/[id]) :**

La page d'édition de document est la page de travail principale de l'application. Elle contient un header avec le logo et le menu utilisateur. La zone principale est divisée en deux parties : la zone d'édition à gauche (ou en haut sur mobile) et le panel d'analyse IA à droite (ou en bas sur mobile). La zone d'édition contient l'éditeur de texte avec sauvegarde automatique. Le panel d'analyse IA permet de lancer des analyses (syntaxe, style, progression narrative) et d'afficher les résultats. Un onglet ou une section permet d'accéder au chat avec l'assistant IA. Un bouton de retour permet de revenir à la liste des documents.

**Sections communes :**

Toutes les pages de l'application partagent certaines sections communes. Le header contient le logo Alfred qui sert également de lien vers la page d'accueil. Le menu utilisateur permet d'accéder au profil et de se déconnecter. Un indicateur de sauvegarde automatique est visible sur la page d'édition pour rassurer l'utilisateur.

**Formulaires :**

L'application contient plusieurs formulaires : le formulaire de connexion (email, mot de passe), le formulaire d'inscription (email, mot de passe, confirmation), le formulaire de création de document (titre, style d'écriture), et le formulaire de chat avec l'assistant IA (message texte). Tous les formulaires incluent une validation côté client et serveur, avec des messages d'erreur clairs.

**Pop-up et modales :**

Des modales de confirmation sont utilisées pour les actions destructives, notamment la suppression d'un document. Ces modales demandent une confirmation explicite de l'utilisateur avant d'exécuter l'action.

**Chat :**

Le chat avec l'assistant IA est intégré dans la page d'édition de document. Il s'affiche dans le panel d'analyse IA et permet à l'utilisateur de converser avec l'assistant pour obtenir des conseils personnalisés basés sur le contenu du document en cours d'édition.

**Moteur de recherche :**

Un moteur de recherche interne permet de rechercher dans les titres des documents. Il est accessible depuis la page de liste des documents et permet de filtrer rapidement les documents par titre.

**Liens :**

Les liens de navigation permettent de naviguer entre les différentes pages de l'application. Des liens de retour sont présents sur les pages secondaires pour revenir à la page précédente. Le logo sert de lien vers la page d'accueil depuis toutes les pages. Aucun lien vers des canaux de communication externes (email, téléphone) ou vers les réseaux sociaux n'est présent dans cette version de l'application.

**FAQ et mentions légales :**

Les pages FAQ et mentions légales ne sont pas encore implémentées dans la Phase 1. Elles pourront être ajoutées dans les phases futures selon les besoins identifiés.

**Aide en ligne :**

L'aide en ligne est fournie via des tooltips contextuels et des messages d'aide dans les formulaires. Un système d'aide plus complet pourra être ajouté dans les phases futures.

**Enchaînement des pages :**

Le parcours utilisateur principal suit cette séquence : page d'accueil → page de connexion ou d'inscription → page de liste des documents → page d'édition d'un document. Depuis la page d'édition, l'utilisateur peut revenir à la liste des documents via le bouton de retour. L'utilisateur peut se déconnecter depuis n'importe quelle page de l'application, ce qui le redirige vers la page de connexion.

**Spécificités par support :**

**Version Desktop :**

Sur desktop, l'interface utilise un layout en deux colonnes pour la page d'édition : la zone d'édition à gauche occupe environ 60% de la largeur, et le panel d'analyse IA à droite occupe environ 40% de la largeur. Le header est fixe en haut de la page. La liste des documents est affichée en grille de 3 colonnes. Tous les éléments sont facilement accessibles et visibles simultanément.

**Version Tablette :**

Sur tablette, le layout s'adapte avec une grille de 2 colonnes pour la liste des documents. Sur la page d'édition, le panel d'analyse IA devient un drawer qui peut être ouvert ou fermé via un bouton. Le header reste fixe mais s'adapte à la taille de l'écran. Les boutons sont suffisamment grands pour être utilisés au toucher.

**Version Mobile :**

Sur mobile, l'interface utilise un layout vertical empilé. La liste des documents est affichée en liste verticale. Sur la page d'édition, la zone d'édition occupe tout l'écran, et le panel d'analyse IA est accessible via un bouton qui ouvre une modal plein écran. Le header contient un menu hamburger pour accéder au menu utilisateur. Les formulaires sont optimisés pour la saisie tactile avec des champs de taille appropriée.

---

**Document rédigé le :** Janvier 2025

---

### 5.7. Fonctionnalités détaillées les plus significatives

Cette section décrit les fonctionnalités principales du point de vue **utilisateur** (ce que la fonctionnalité fait), complétées par des diagrammes (activité et séquence) et par la description des données et règles d’affichage associées.

#### 5.7.1. Accéder à l’espace authentifié (inscription / connexion / déconnexion)

##### Description

L’utilisateur peut créer un compte ou se connecter pour accéder à son espace privé (documents, livres, analyses IA). Une fois authentifié, il reste connecté jusqu’à ce qu’il se déconnecte. L’application empêche l’accès aux écrans privés si l’utilisateur n’est pas authentifié.

##### Diagramme d’activité

Voir `docs/diagramme-activite-auth.puml`.

##### Diagramme de séquence

Voir `docs/diagramme-sequence-auth.puml`.

##### Données / actions

| En entrée | Traitement | En sortie | Contrôles |
|---|---|---|---|
| Email (`email`) | Validation du format, création de compte ou vérification des identifiants | Utilisateur authentifié (`user`) | Email valide (Zod), email unique (inscription) |
| Mot de passe (`password`) | Vérification des règles (inscription) et comparaison sécurisée (connexion) | Jeton d’accès (`token`) | Longueur min. (inscription), mot de passe requis (connexion) |
| Action demandée (connexion/inscription) | Application du rate limiting pour limiter brute force/spam | Redirection vers `/documents` | Rate limit auth : 5 requêtes / 15 minutes |

**Dictionnaire de données (extrait)**

| Name | Code | Type | Longueur | Sémantique | Valeurs / limites |
|---|---|---|---|---|---|
| Email | `email` | Texte | 254 (référence) | Identifiant de connexion | Doit respecter un format email |
| Mot de passe | `password` | Texte | 8 à 128 (référence) | Secret utilisateur | \(\ge\) 8 caractères |
| Jeton JWT | `token` | Texte | n/a | Preuve d’authentification | Envoyé via `Authorization: Bearer <token>` |

##### Écran / affichage

- **Écrans concernés** : `/login`, `/register`, zone privée (`/documents`, `/books`, `/documents/[id]`, `/books/[id]`).
- **Règles d’affichage** :
  - Les champs email/mot de passe affichent des messages d’erreur en cas de saisie invalide.
  - Le bouton de soumission est désactivé pendant l’envoi (état “chargement”).
  - En cas d’échec (identifiants invalides, rate limit, erreur serveur), un message explicite est affiché.
  - Si l’utilisateur est déjà authentifié, il est redirigé automatiquement vers `/documents`.

---

#### 5.7.2. Gérer ses documents (liste, création, édition, suppression, réorganisation)

##### Description

L’utilisateur peut consulter la liste de ses documents, créer un nouveau document, ouvrir un document pour l’éditer, supprimer un document et réorganiser l’ordre d’affichage. Depuis la page d’édition, l’utilisateur peut modifier le contenu ; la sauvegarde est effectuée automatiquement afin d’éviter la perte de travail.

##### Diagramme d’activité

Voir `docs/diagramme-activite-documents.puml`.

##### Diagramme de séquence

Voir `docs/diagramme-sequence-documents.puml`.

##### Données / actions

| En entrée | Traitement | En sortie | Contrôles |
|---|---|---|---|
| Jeton JWT (`Authorization`) | Authentification et contrôle d’accès | Liste des documents | Token requis et valide |
| Titre (`title`) | Création / mise à jour du titre | Document créé ou mis à jour | Requis à la création, longueur max 200 caractères |
| Contenu (`content`) | Calcul/maintien du nombre de mots, version, date MAJ | Contenu sauvegardé | Requis à la création, optionnel à la mise à jour |
| Style (`styleId`) | Association à un style d’écriture | Style rattaché au document | `styleId` requis, style existant |
| Ordre (`documentIds[]`) | Réorganisation des documents | Ordre enregistré | Liste non vide, IDs valides |
| Identifiant document (`id`) | Chargement / suppression | Document affiché ou supprimé | 404 si inexistant, 403 si non propriétaire |

**Dictionnaire de données (extrait)**

| Name | Code | Type | Longueur | Sémantique | Valeurs / limites |
|---|---|---|---|---|---|
| Identifiant document | `id` | Texte | UUID | Identifiant unique | Non vide |
| Titre | `title` | Texte | 200 (référence) | Titre visible par l’utilisateur | Non vide à la création |
| Contenu | `content` | Texte | n/a | Texte du document | Non vide à la création |
| Style d’écriture | `styleId` | Texte | UUID | Référence vers un style | Doit exister (réf. `/api/styles`) |
| Ordre d’affichage | `sortOrder` | Numérique | n/a | Position dans la liste | Géré par le système |

##### Écran / affichage

- **Écrans concernés** : `/documents` (liste + création), `/documents/[id]` (édition).
- **Éléments UI** :
  - Bouton “Nouveau document”, formulaire (titre, style), cartes de documents, action “supprimer”.
  - Drag & drop pour réorganiser les documents (avec rollback visuel en cas d’échec).
- **Règles d’affichage** :
  - Affichage d’un état de chargement lors de la récupération des données.
  - Affichage d’un message “aucun document” si la liste est vide.
  - Confirmation pour les actions destructives (suppression).
  - Indicateur de sauvegarde automatique sur la page d’édition.

---

#### 5.7.3. Analyser un document avec l’assistant IA (syntaxe, style, progression)

##### Description

Depuis la page d’édition, l’utilisateur peut lancer une analyse IA sur le document en cours. Selon le type d’analyse choisi, l’application renvoie des suggestions actionnables (corrections, recommandations de style, propositions de progression narrative) qui aident l’utilisateur à améliorer son texte.

##### Diagramme d’activité

Voir `docs/diagramme-activite-analyse-ia.puml`.

##### Diagramme de séquence

Voir `docs/diagramme-sequence-analyse-ia.puml`.

##### Données / actions

| En entrée | Traitement | En sortie | Contrôles |
|---|---|---|---|
| Jeton JWT (`Authorization`) | Authentification + vérification propriétaire du document | Résultat d’analyse | Token requis et valide |
| Identifiant document (`documentId`) | Chargement du document à analyser | Suggestions (`suggestions[]`) | Document existant, 403 si non propriétaire |
| Type d’analyse (`analysisType`) | Exécution de l’analyse via le module IA | Score de confiance (`confidence`) | Enum : `syntax`, `style`, `progression` |
| Demande d’analyse | Application d’un rate limiting spécifique IA | Métadonnées (`processingTime`, `timestamp`) | Rate limit IA : 10 requêtes / minute |

**Dictionnaire de données (extrait)**

| Name | Code | Type | Longueur | Sémantique | Valeurs / limites |
|---|---|---|---|---|---|
| Identifiant document | `documentId` | Texte | UUID | Document à analyser | Non vide |
| Type d’analyse | `analysisType` | Enum | n/a | Mode d’analyse IA | `syntax` \| `style` \| `progression` |
| Suggestions | `suggestions` | Liste de textes | n/a | Recommandations IA | Peut être vide si aucune suggestion |
| Confiance | `confidence` | Numérique | 0..1 | Qualité estimée du résultat | \([0,1]\) |

##### Écran / affichage

- **Écran concerné** : `/documents/[id]`.
- **Éléments UI** : boutons de lancement d’analyse (syntaxe, style, progression), zone d’affichage des résultats, message d’erreur si échec.
- **Règles d’affichage** :
  - Un état “en cours” est affiché pendant l’analyse.
  - Les résultats sont présentés sous forme de liste de suggestions lisibles.
  - En cas d’atteinte du rate limit, l’utilisateur est informé et invité à réessayer plus tard.

---

#### 5.7.4. Gérer ses livres (création, liste, consultation, suppression, réorganisation)

##### Description

L’utilisateur peut créer des livres pour regrouper ses documents sous forme de chapitres. Il peut consulter la liste de ses livres, réorganiser l’ordre des livres, supprimer un livre, et consulter un livre pour voir les chapitres qu’il contient.

##### Diagramme d’activité

Voir `docs/diagramme-activite-livres.puml`.

##### Diagramme de séquence

Voir `docs/diagramme-sequence-livres.puml`.

##### Données / actions

| En entrée | Traitement | En sortie | Contrôles |
|---|---|---|---|
| Jeton JWT (`Authorization`) | Authentification + filtrage par utilisateur | Liste des livres | Token requis et valide |
| Titre (`title`) | Création/mise à jour d’un livre | Livre créé/mis à jour | Titre requis |
| Description (`description`) | Enregistrement d’une description optionnelle | Détail du livre | Peut être `null` |
| Identifiant livre (`id`) | Chargement / suppression | Livre consulté ou supprimé | 404 si inexistant, 403 si non propriétaire |
| Ordre (`bookIds[]`) | Réorganisation des livres | Ordre enregistré | Liste non vide, IDs valides |

**Dictionnaire de données (extrait)**

| Name | Code | Type | Longueur | Sémantique | Valeurs / limites |
|---|---|---|---|---|---|
| Identifiant livre | `id` | Texte | UUID | Identifiant unique | Non vide |
| Titre du livre | `title` | Texte | n/a | Nom visible | Non vide |
| Description | `description` | Texte | n/a | Complément optionnel | `null` autorisé |
| Ordre d’affichage | `sortOrder` | Numérique | n/a | Position du livre | Géré par le système |
| Nombre de chapitres | `chapterCount` | Numérique | n/a | Documents rattachés | Calculé |

##### Écran / affichage

- **Écrans concernés** : `/books`, `/books/[id]`, section “livres” sur `/documents`.
- **Règles d’affichage** :
  - Affichage d’un état de chargement lors du chargement de la liste.
  - Affichage d’un message “aucun livre” si la liste est vide.
  - Réorganisation par drag & drop (avec rollback visuel en cas d’échec).
  - Suppression avec confirmation et message explicite sur l’impact : les chapitres ne sont pas supprimés, ils sont retirés du livre.

---

#### 5.7.5. Classer un document dans un livre (et réorganiser les chapitres)

##### Description

L’utilisateur peut affecter un document à un livre afin d’en faire un chapitre. Il peut aussi retirer un document d’un livre. Une fois dans un livre, l’utilisateur peut réordonner les chapitres pour structurer l’histoire. Ces actions permettent d’organiser un projet d’écriture à partir de documents existants.

##### Diagramme d’activité

Voir `docs/diagramme-activite-classement-document-livre.puml`.

##### Diagramme de séquence

Voir `docs/diagramme-sequence-classement-document-livre.puml`.

##### Données / actions

| En entrée | Traitement | En sortie | Contrôles |
|---|---|---|---|
| Identifiant document (`documentId`) | Rattachement au livre / détachement | Document déplacé | Document existant, propriétaire vérifié |
| Identifiant livre (`bookId`) ou `null` | Affectation à un livre ou retrait | Chapitre mis à jour | Si `bookId` non nul : livre existant et accessible |
| Ordre de chapitre (`chapterOrder`) | Mise à jour de l’ordre dans le livre | Chapitres réordonnés | Valeur numérique ou `null` lors du retrait |
| Jeton JWT (`Authorization`) | Authentification | Message de succès | Token requis et valide |

**Dictionnaire de données (extrait)**

| Name | Code | Type | Longueur | Sémantique | Valeurs / limites |
|---|---|---|---|---|---|
| Identifiant livre | `bookId` | Texte / null | UUID | Cible de classement | `null` = retirer du livre |
| Ordre du chapitre | `chapterOrder` | Numérique / null | n/a | Position du chapitre | \( \ge 0 \) (référence) |

##### Écran / affichage

- **Écrans concernés** : `/documents` (drag & drop vers un livre + zone de retrait), `/books/[id]` (liste des chapitres + réorganisation).
- **Règles d’affichage** :
  - Les livres apparaissent comme zones de dépôt (“drop zones”) pour classer un document.
  - Une zone “retirer du livre” est affichée lorsqu’au moins un document est classé.
  - Lors du drag & drop, l’ordre est mis à jour et persisté ; en cas d’échec, l’ordre précédent est restauré visuellement.
