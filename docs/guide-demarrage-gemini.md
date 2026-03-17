# 🚀 Guide de démarrage rapide - Gemini

Guide ultra-rapide pour configurer et utiliser Google Gemini avec Alfred.

## ⚡ Installation en 3 étapes

### 1. Installer les dépendances

```bash
npm install
```

### 2. Créer le fichier `.env.local`

Copiez `.env.example` et renommez-le en `.env.local` :

```bash
# Windows PowerShell
copy .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

### 3. Configurer Gemini

Éditez `.env.local` et ajoutez vos clés :

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="VOTRE_CLE_API_ICI"

# Autres variables nécessaires
DATABASE_URL="postgresql://..."
JWT_SECRET="votre-secret-jwt"
```

## 🔑 Obtenir une clé Gemini

1. Allez sur https://makersuite.google.com/app/apikey
2. Connectez-vous avec Google
3. Cliquez sur "Create API Key"
4. Copiez la clé (format: `AIzaSy...`)

## ✅ Vérification

Lancez l'application :

```bash
npm run dev
```

Ouvrez http://localhost:3000 et testez l'analyse IA !

## 📊 Comparaison des providers

| Provider | Gratuit | Performance | Français |
|----------|---------|-------------|----------|
| **Gemini** | ✅ Généreux | ⚡ Très rapide | ✅ Excellent |
| Claude | ❌ Limité | ⚡ Rapide | ✅ Excellent |
| OpenAI | ❌ Payant | ⚡ Rapide | ✅ Bon |

## 🔄 Changer de provider

Modifiez simplement `AI_PROVIDER` dans `.env.local` :

```env
# Gemini (recommandé pour commencer)
AI_PROVIDER="gemini"

# Claude
AI_PROVIDER="claude"

# OpenAI
AI_PROVIDER="openai"
```

## 🐛 Problèmes courants

### ❌ "GEMINI_API_KEY is not defined"

➡️ Vérifiez que le fichier `.env.local` existe et contient `GEMINI_API_KEY`

### ❌ "Module not found: @google/generative-ai"

➡️ Lancez `npm install`

### ❌ "Invalid API key"

➡️ Vérifiez votre clé sur https://makersuite.google.com/app/apikey

## 📚 Documentation complète

Pour plus de détails, consultez [configuration-gemini.md](./configuration-gemini.md)

---

**Prêt à écrire avec l'IA !** 🎉
