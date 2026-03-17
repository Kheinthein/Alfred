# ⚡ ACTION REQUISE - Configuration Gemini

> **🎉 Bonne nouvelle !** Votre application Alfred supporte maintenant Google Gemini !

## 🚨 À FAIRE MAINTENANT

Pour utiliser Gemini, suivez ces **3 étapes simples** :

### 1️⃣ Installer les dépendances (2 min)

Ouvrez PowerShell et lancez :

```powershell
npm install
```

Cela installera le SDK `@google/generative-ai`.

### 2️⃣ Obtenir une clé API Gemini (2 min)

1. Allez sur https://makersuite.google.com/app/apikey
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Create API Key"**
4. Copiez la clé (format: `AIzaSy...`)

💡 **C'est GRATUIT avec un quota généreux !**

### 3️⃣ Configurer l'application (1 min)

**Option A - Automatique (recommandé)** :

```powershell
.\scripts\setup-gemini.ps1
```

Le script vous guidera et configurera tout automatiquement.

**Option B - Manuel** :

1. Copiez `.env.example` vers `.env.local`
2. Éditez `.env.local` et ajoutez :

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="VOTRE_CLE_ICI"
```

## ✅ Vérification

Vérifiez que tout est bien configuré :

```powershell
npm run check:gemini
```

## 🚀 Lancer l'application

```powershell
npm run dev
```

Puis testez l'analyse IA dans l'interface !

## 📚 Documentation complète

Si vous voulez en savoir plus :

- **Guide rapide** : `docs/guide-demarrage-gemini.md`
- **Configuration détaillée** : `docs/configuration-gemini.md`
- **Migration depuis Claude/OpenAI** : `docs/migration-vers-gemini.md`

## 💡 Pourquoi Gemini ?

- 💰 **Gratuit** : Quota généreux pour le développement
- ⚡ **Rapide** : Réponses ultra-rapides
- 🇫🇷 **Excellent en français** : Qualité comparable à Claude
- 🎯 **Facile** : Configuration en 5 minutes

## 🆘 Besoin d'aide ?

### ❌ "Module not found: @google/generative-ai"

➡️ Lancez `npm install`

### ❌ "Invalid API key"

➡️ Vérifiez que votre clé commence par `AIzaSy`

### 🤔 Autres problèmes

Consultez `docs/configuration-gemini.md` section "Dépannage"

## 🎯 Prochaines étapes (après configuration)

1. ✅ Tester les 3 types d'analyses IA
2. ✅ Comparer avec votre provider actuel (si vous en aviez un)
3. ✅ Profiter du quota gratuit pour développer ! 🎉

---

## 📋 Récapitulatif des fichiers

### ✨ Nouveaux fichiers créés
```
✅ GeminiAdapter.ts             # Adapter Gemini
✅ GeminiAdapter.test.ts        # Tests unitaires
✅ .env.example                  # Template de config
✅ docs/configuration-gemini.md # Guide complet
✅ docs/guide-demarrage-gemini.md # Guide rapide
✅ docs/migration-vers-gemini.md  # Guide migration
✅ scripts/check-gemini-config.ts # Vérification
✅ scripts/setup-gemini.ps1      # Setup automatique
```

### 🔧 Fichiers modifiés
```
✅ package.json                  # Ajout dépendance + script
✅ src/shared/types/index.ts    # Ajout type 'gemini'
✅ AIAdapterFactory.ts           # Support de Gemini
```

### 💯 100% Rétrocompatible
- ✅ Aucun changement breaking
- ✅ Claude et OpenAI fonctionnent toujours
- ✅ Basculement instantané entre providers

---

## 🎉 C'est tout !

**Temps estimé** : 5 minutes  
**Difficulté** : Facile  
**Coût** : Gratuit

Une fois configuré, vous pourrez utiliser Gemini pour toutes vos analyses IA dans Alfred !

---

**Des questions ?** Lancez `npm run check:gemini` ou consultez la documentation.

**Prêt ?** Commencez par l'étape 1 ci-dessus ! 🚀
