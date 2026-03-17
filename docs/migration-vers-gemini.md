# 🔄 Migration vers Google Gemini

Guide pour migrer de Claude ou OpenAI vers Google Gemini.

## 📋 Pourquoi migrer vers Gemini ?

- 💰 **Quota gratuit généreux** : Idéal pour le développement
- ⚡ **Performance** : Très rapide, surtout avec le modèle Flash
- 🇫🇷 **Excellent en français** : Qualité comparable à Claude
- 🆓 **Réduire les coûts** : Économiser sur les appels API en dev

## 🚀 Migration rapide

### Depuis Claude

#### Avant (Claude)
```env
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="sk-ant-xxxxx"
CLAUDE_MODEL="claude-3-5-sonnet-20241022"
```

#### Après (Gemini)
```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyxxxxx"
GEMINI_MODEL="gemini-1.5-pro"
```

### Depuis OpenAI

#### Avant (OpenAI)
```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-xxxxx"
OPENAI_MODEL="gpt-4-turbo"
```

#### Après (Gemini)
```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyxxxxx"
GEMINI_MODEL="gemini-1.5-pro"
```

## 🔑 Obtenir une clé Gemini

1. Rendez-vous sur https://makersuite.google.com/app/apikey
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Create API Key"**
4. Copiez la clé (format: `AIzaSy...`)

⚠️ Conservez vos anciennes clés pour pouvoir revenir en arrière si besoin !

## 🔧 Étapes de migration

### 1. Installer la dépendance Gemini

```bash
npm install @google/generative-ai
```

### 2. Mettre à jour .env.local

```bash
# Option automatique avec le script
.\scripts\setup-gemini.ps1

# Option manuelle
# Éditez .env.local et ajoutez:
AI_PROVIDER="gemini"
GEMINI_API_KEY="votre_cle_ici"
GEMINI_MODEL="gemini-1.5-pro"
```

### 3. Vérifier la configuration

```bash
npm run check:gemini
```

### 4. Tester l'application

```bash
npm run dev
```

Testez les fonctionnalités IA :
- ✅ Analyse syntaxique
- ✅ Analyse de style
- ✅ Suggestions de progression

## 📊 Équivalence des modèles

### Claude → Gemini

| Claude | Gemini | Usage |
|--------|--------|-------|
| claude-3-opus | gemini-1.5-pro | Analyses complexes |
| claude-3-5-sonnet | gemini-1.5-pro | Usage général (recommandé) |
| claude-3-haiku | gemini-1.5-flash | Analyses rapides |

### OpenAI → Gemini

| OpenAI | Gemini | Usage |
|--------|--------|-------|
| gpt-4 | gemini-1.5-pro | Analyses complexes |
| gpt-4-turbo | gemini-1.5-pro | Usage général (recommandé) |
| gpt-3.5-turbo | gemini-1.5-flash | Analyses rapides |

## 🎯 Recommandations par cas d'usage

### Développement local
```env
# Recommandé: Gemini (gratuit)
AI_PROVIDER="gemini"
GEMINI_MODEL="gemini-1.5-flash"  # Plus rapide
```

### Tests et CI/CD
```env
# Recommandé: Gemini (quota généreux)
AI_PROVIDER="gemini"
GEMINI_MODEL="gemini-1.5-pro"
```

### Production (petite échelle)
```env
# Option 1: Gemini (économique)
AI_PROVIDER="gemini"
GEMINI_MODEL="gemini-1.5-pro"
```

### Production (grande échelle)
```env
# Option 1: Claude (qualité premium)
AI_PROVIDER="claude"
CLAUDE_MODEL="claude-3-5-sonnet-20241022"

# Option 2: Multi-provider (load balancing)
# Voir section "Configuration avancée"
```

## 🔄 Stratégie multi-provider (Avancé)

### Garder plusieurs providers configurés

```env
# Gemini (développement)
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyxxxxx"
GEMINI_MODEL="gemini-1.5-pro"

# Claude (production)
ANTHROPIC_API_KEY="sk-ant-xxxxx"
CLAUDE_MODEL="claude-3-5-sonnet-20241022"

# OpenAI (backup)
OPENAI_API_KEY="sk-xxxxx"
OPENAI_MODEL="gpt-4-turbo"
```

### Changer de provider facilement

```bash
# Développement
AI_PROVIDER="gemini"

# Production
AI_PROVIDER="claude"

# Tests
AI_PROVIDER="openai"
```

## 🧪 Tests de validation

Après migration, vérifiez que tout fonctionne :

### 1. Tests unitaires

```bash
npm run test:unit
```

### 2. Tests d'intégration

```bash
npm run test:integration
```

### 3. Tests manuels

1. Créer un document
2. Lancer analyse syntaxe → Vérifier résultats
3. Lancer analyse style → Vérifier résultats
4. Lancer suggestions progression → Vérifier résultats

## 📈 Monitoring de la migration

### Métriques à surveiller

1. **Temps de réponse** : Gemini devrait être similaire ou plus rapide
2. **Qualité des suggestions** : Comparer avec les résultats précédents
3. **Taux d'erreur** : Doit rester à 0%
4. **Coût** : Devrait diminuer significativement

### Exemple de comparaison

```typescript
// scripts/compare-providers.ts
const testText = "Votre texte de test";

// Test avec Claude
process.env.AI_PROVIDER = "claude";
const claudeResult = await analyzeWithProvider(testText);

// Test avec Gemini
process.env.AI_PROVIDER = "gemini";
const geminiResult = await analyzeWithProvider(testText);

console.log('Comparaison:', {
  claude: claudeResult,
  gemini: geminiResult
});
```

## 🐛 Résolution de problèmes

### Erreur: "Invalid API key"

➡️ Vérifiez que votre clé Gemini commence par `AIzaSy`

### Erreur: "Module not found"

➡️ Lancez `npm install` pour installer `@google/generative-ai`

### Résultats différents de Claude/OpenAI

➡️ Normal : chaque modèle a son style. Ajustez les prompts si nécessaire.

### Performance plus lente

➡️ Essayez `gemini-1.5-flash` au lieu de `gemini-1.5-pro`

## 🔙 Rollback

Si vous devez revenir en arrière :

### 1. Réactiver l'ancien provider

```env
# Pour Claude
AI_PROVIDER="claude"

# Pour OpenAI
AI_PROVIDER="openai"
```

### 2. Redémarrer l'application

```bash
npm run dev
```

### 3. Vérifier que tout fonctionne

✅ L'ancien provider doit fonctionner immédiatement sans changement de code

## 💰 Estimation des économies

### Exemple : 10,000 requêtes/mois

| Provider | Coût estimé | Économie |
|----------|-------------|----------|
| Claude (Sonnet) | ~50€/mois | - |
| OpenAI (GPT-4) | ~70€/mois | - |
| **Gemini (Pro)** | **~0-5€/mois** | **90-100%** |

*Prix indicatifs, consultez les tarifs officiels*

## 📚 Ressources

- [Documentation Gemini](https://ai.google.dev/docs)
- [Guide de configuration](./configuration-gemini.md)
- [Comparaison des providers](./comparaison-providers.md)
- [API Gemini pricing](https://ai.google.dev/pricing)

## ✅ Checklist de migration

- [ ] Obtenir une clé API Gemini
- [ ] Installer `@google/generative-ai`
- [ ] Mettre à jour `.env.local`
- [ ] Lancer `npm run check:gemini`
- [ ] Tester l'application
- [ ] Vérifier les analyses IA
- [ ] Comparer les résultats (optionnel)
- [ ] Monitorer les performances
- [ ] Mettre à jour la documentation projet
- [ ] Communiquer aux autres développeurs

## 🎉 Conclusion

La migration vers Gemini est **transparente** grâce à l'architecture Ports & Adapters. Vous pouvez :

- ✅ Changer de provider en 30 secondes
- ✅ Garder plusieurs providers configurés
- ✅ Revenir en arrière instantanément
- ✅ Économiser significativement sur les coûts

**Questions ?** Consultez la [documentation complète](./configuration-gemini.md) ou lancez `npm run check:gemini`

---

**Version:** 1.0.0  
**Dernière mise à jour:** Février 2026
