# 🎯 Configuration Gemini - Récapitulatif

Votre application Alfred supporte maintenant Google Gemini ! Voici comment l'activer.

## ✅ Ce qui a été fait

1. ✅ Création de `GeminiAdapter.ts` - Adapter pour l'API Gemini
2. ✅ Mise à jour de `AIAdapterFactory.ts` - Ajout du support Gemini
3. ✅ Mise à jour des types `AIProvider` - Ajout de 'gemini'
4. ✅ Ajout de `@google/generative-ai` dans `package.json`
5. ✅ Création de `.env.example` - Template de configuration
6. ✅ Création de tests unitaires pour GeminiAdapter
7. ✅ Documentation complète dans `docs/`
8. ✅ Script de vérification de configuration

## 🚀 Prochaines étapes (À FAIRE)

### 1. Installer les dépendances

Lancez cette commande dans votre terminal PowerShell :

```powershell
npm install
```

Cela installera le package `@google/generative-ai`.

### 2. Créer le fichier `.env.local`

Si vous n'avez pas encore de fichier `.env.local`, créez-le en copiant `.env.example` :

```powershell
# Copier le template
Copy-Item .env.example .env.local
```

### 3. Ajouter votre clé API Gemini

1. Obtenez une clé API sur https://makersuite.google.com/app/apikey
2. Ouvrez `.env.local`
3. Modifiez ces lignes :

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSy_VOTRE_CLE_ICI"
GEMINI_MODEL="gemini-1.5-pro"
```

### 4. Vérifier la configuration

Lancez le script de vérification :

```powershell
npm run check:gemini
```

Ce script vous indiquera si tout est correctement configuré.

### 5. Lancer l'application

```powershell
npm run dev
```

Ouvrez http://localhost:3000 et testez l'analyse IA !

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
- `src/modules/ai-assistant/infrastructure/ai/GeminiAdapter.ts`
- `tests/unit/modules/ai-assistant/infrastructure/ai/GeminiAdapter.test.ts`
- `docs/configuration-gemini.md`
- `docs/guide-demarrage-gemini.md`
- `scripts/check-gemini-config.ts`
- `.env.example`
- `GEMINI_SETUP.md` (ce fichier)

### Fichiers modifiés
- `src/shared/types/index.ts` - Ajout de 'gemini' au type AIProvider
- `src/modules/ai-assistant/infrastructure/ai/AIAdapterFactory.ts` - Support de Gemini
- `package.json` - Ajout de @google/generative-ai et script check:gemini

## 🧪 Tester Gemini

Une fois configuré :

1. Créez ou ouvrez un document
2. Écrivez du texte
3. Cliquez sur un bouton d'analyse IA :
   - **Analyse syntaxe** : Vérifie grammaire et orthographe
   - **Analyse style** : Évalue le ton et vocabulaire
   - **Suggestions progression** : Propose des idées pour continuer

## 🔄 Changer de provider IA

Pour revenir à Claude ou essayer OpenAI, modifiez simplement `AI_PROVIDER` dans `.env.local` :

```env
# Pour Claude (Anthropic)
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="sk-ant-xxxxx"

# Pour OpenAI
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-xxxxx"

# Pour Gemini (Google)
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyxxxxx"
```

## 📊 Comparaison rapide

| Critère | Gemini | Claude | OpenAI |
|---------|--------|--------|--------|
| **Prix** | 💚 Quota gratuit généreux | 🟡 Limité | 🔴 Payant |
| **Vitesse** | ⚡ Très rapide | ⚡ Rapide | ⚡ Rapide |
| **Qualité français** | ✅ Excellente | ✅ Excellente | 🟡 Bonne |
| **Modèles** | Pro & Flash | Sonnet & Opus | GPT-4 variants |

## 🆘 Aide

### Problèmes d'installation

Si `npm install` échoue à cause du chemin avec accents :

1. Option 1 : Ouvrez un terminal CMD (pas PowerShell) et lancez `npm install`
2. Option 2 : Téléchargez le package manuellement

### Vérifier que tout fonctionne

```powershell
# Vérifier la configuration
npm run check:gemini

# Vérifier les types TypeScript
npm run type-check

# Lancer les tests
npm test
```

### Ressources

- 📚 [Guide complet](./docs/configuration-gemini.md)
- 🚀 [Guide de démarrage rapide](./docs/guide-demarrage-gemini.md)
- 🌐 [Documentation Gemini officielle](https://ai.google.dev/docs)
- 🔑 [Obtenir une clé API](https://makersuite.google.com/app/apikey)

## 💡 Conseils

1. **Pour le développement** : Utilisez Gemini (quota gratuit généreux)
2. **Pour la production** : Évaluez selon vos besoins et budget
3. **Test rapide** : `gemini-1.5-flash` est plus rapide mais moins précis
4. **Meilleure qualité** : `gemini-1.5-pro` est plus lent mais plus précis

## ⚠️ Important

- ❌ Ne committez JAMAIS votre clé API dans Git
- ✅ Le fichier `.env.local` est déjà dans `.gitignore`
- ✅ Utilisez `.env.example` comme template pour les nouveaux dev
- ✅ Rotez vos clés API régulièrement

---

**Questions ?** Consultez les docs dans `docs/` ou testez avec `npm run check:gemini`

🎉 **Bon développement avec Alfred + Gemini !**
