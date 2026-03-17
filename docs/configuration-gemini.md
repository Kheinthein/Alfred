# Configuration de Google Gemini pour Alfred

## 📋 Vue d'ensemble

Alfred supporte maintenant Google Gemini comme provider d'IA, en plus de Claude et OpenAI. Ce guide vous explique comment configurer et utiliser Gemini.

## 🔑 Obtenir une clé API Gemini

1. Rendez-vous sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Get API Key" ou "Créer une clé API"
4. Copiez la clé générée (format: `AIzaSy...`)

⚠️ **Sécurité** : Ne partagez jamais votre clé API et ne la committez pas dans Git !

## ⚙️ Configuration

### 1. Installation des dépendances

```bash
npm install
```

Cette commande installera automatiquement le SDK `@google/generative-ai`.

### 2. Configuration des variables d'environnement

Créez ou modifiez votre fichier `.env.local` :

```env
# Sélectionner Gemini comme provider
AI_PROVIDER="gemini"

# Ajouter votre clé API
GEMINI_API_KEY="AIzaSy_votre_cle_api_ici"

# (Optionnel) Choisir un modèle spécifique
GEMINI_MODEL="gemini-1.5-pro"
```

### 3. Modèles disponibles

Gemini propose plusieurs modèles :

| Modèle | Description | Usage recommandé |
|--------|-------------|------------------|
| `gemini-1.5-pro` | Le plus puissant (par défaut) | Analyses complexes, suggestions créatives |
| `gemini-1.5-flash` | Rapide et efficace | Analyses syntaxiques simples |
| `gemini-pro` | Version précédente | Compatible si 1.5 non disponible |

## 🚀 Utilisation

Une fois configuré, l'application utilisera automatiquement Gemini pour :

- ✅ **Analyse syntaxique** : Détection des erreurs de grammaire, orthographe et ponctuation
- ✅ **Analyse de style** : Évaluation du ton et du vocabulaire par rapport au style cible
- ✅ **Suggestions de progression** : Idées pour faire avancer votre récit
- ✅ **Résumés** : Génération de résumés concis

## 🔄 Changer de provider

Pour revenir à Claude ou OpenAI, modifiez simplement `AI_PROVIDER` dans `.env.local` :

```env
# Pour Claude
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="sk-ant-xxxxx"

# Pour OpenAI
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-xxxxx"

# Pour Gemini
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyxxxxx"
```

## 🛠️ Architecture technique

### Structure du code

```
src/modules/ai-assistant/infrastructure/ai/
├── GeminiAdapter.ts        # Implémentation Gemini
├── ClaudeAdapter.ts        # Implémentation Claude
├── OpenAIAdapter.ts        # Implémentation OpenAI
└── AIAdapterFactory.ts     # Factory pour créer le bon adapter
```

### Interface unifiée

Tous les adapters implémentent `IAIServicePort` :

```typescript
interface IAIServicePort {
  analyzeSyntax(text: string): Promise<SyntaxAnalysisResult>;
  analyzeStyle(text: string, targetStyle: WritingStyle): Promise<StyleAnalysisResult>;
  suggestProgression(text: string, style: WritingStyle, context?: string): Promise<ProgressionSuggestionResult>;
  summarize(text: string, maxWords: number): Promise<string>;
}
```

## 🧪 Tests

Pour tester que Gemini fonctionne correctement :

1. Lancez l'application : `npm run dev`
2. Créez ou ouvrez un document
3. Utilisez les boutons d'analyse IA dans le panneau latéral
4. Vérifiez que les suggestions s'affichent correctement

## 🐛 Dépannage

### Erreur : "Gemini API key est requis"

➡️ Vérifiez que `GEMINI_API_KEY` est bien défini dans `.env.local`

### Erreur : "Module @google/generative-ai not found"

➡️ Exécutez `npm install` pour installer les dépendances

### Erreur : "Invalid API key"

➡️ Vérifiez que votre clé API est valide sur [Google AI Studio](https://makersuite.google.com/app/apikey)

### Réponses lentes

➡️ Essayez le modèle `gemini-1.5-flash` pour des performances plus rapides

## 💰 Tarification

- Gemini dispose d'un quota gratuit généreux pour le développement
- Consultez [la page de tarification](https://ai.google.dev/pricing) pour les détails
- Le modèle `gemini-1.5-flash` est généralement le plus économique

## 📚 Ressources

- [Documentation officielle Gemini](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [SDK Node.js](https://github.com/google/generative-ai-js)

## 🎯 Avantages de Gemini

- ✅ Quota gratuit généreux
- ✅ Excellentes performances en français
- ✅ Support multimodal (texte, images)
- ✅ Modèles rapides (flash) et puissants (pro)
- ✅ API simple et bien documentée

---

**Version** : 1.0.0  
**Dernière mise à jour** : Février 2026
