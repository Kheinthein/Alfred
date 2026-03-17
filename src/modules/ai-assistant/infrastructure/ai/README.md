# Adapters IA

Ce dossier contient les adapters pour différents providers d'IA, implémentant tous l'interface `IAIServicePort`.

## 🏗️ Architecture

```
Pattern: Adapter + Factory (Ports & Adapters / Clean Architecture)

Domain (IAIServicePort) ←─── Infrastructure (Adapters)
         ↑                            ↓
         │                    ClaudeAdapter
         │                    OpenAIAdapter
         │                    GeminiAdapter
         │                    (futurs adapters...)
         │
         └─── AIAdapterFactory (créé le bon adapter)
```

## 📦 Adapters disponibles

### ✅ ClaudeAdapter (Anthropic)

**Fichier:** `ClaudeAdapter.ts`

**Modèles supportés:**
- `claude-3-5-sonnet-20241022` (par défaut, recommandé)
- `claude-3-opus-20240229` (le plus puissant)
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307` (le plus rapide)

**Configuration:**
```env
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="sk-ant-xxxxx"
CLAUDE_MODEL="claude-3-5-sonnet-20241022"
```

**Caractéristiques:**
- ✅ Excellent en français
- ✅ Très précis pour l'analyse littéraire
- ✅ Gestion robuste du parsing JSON
- 💰 Tarification à l'usage

### ✅ OpenAIAdapter

**Fichier:** `OpenAIAdapter.ts`

**Modèles supportés:**
- `gpt-4-turbo` (par défaut, recommandé)
- `gpt-4`
- `gpt-3.5-turbo` (plus rapide, moins cher)

**Configuration:**
```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-xxxxx"
OPENAI_MODEL="gpt-4-turbo"
```

**Caractéristiques:**
- ✅ Mode JSON natif (`response_format: json_object`)
- ✅ Bon en français
- ✅ Large écosystème
- 💰 Tarification à l'usage

### ✅ GeminiAdapter (Google)

**Fichier:** `GeminiAdapter.ts`

**Modèles supportés:**
- `gemini-1.5-pro` (par défaut, recommandé)
- `gemini-1.5-flash` (plus rapide)
- `gemini-pro` (version précédente)

**Configuration:**
```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyxxxxx"
GEMINI_MODEL="gemini-1.5-pro"
```

**Caractéristiques:**
- ✅ Excellent en français
- ✅ Quota gratuit généreux
- ✅ Très rapide (surtout flash)
- ✅ Multimodal (texte + images)
- 💚 Idéal pour le développement

### ⏳ MistralAdapter (À venir)

**Status:** Non implémenté

**Modèles prévus:**
- `mistral-large-latest`
- `mistral-medium`
- `mistral-small`

### ⏳ OllamaAdapter (À venir)

**Status:** Non implémenté

**Caractéristiques:**
- Local (pas de clé API)
- Gratuit
- Offline
- Modèles: llama3.1, mistral, etc.

## 🔧 Utilisation

### Via Factory (recommandé)

```typescript
import { AIAdapterFactory } from './AIAdapterFactory';

// Depuis les variables d'environnement
const aiService = AIAdapterFactory.createFromEnv();

// Configuration manuelle
const aiService = AIAdapterFactory.create({
  provider: 'gemini',
  apiKey: 'AIzaSy...',
  model: 'gemini-1.5-pro'
});
```

### Directement (pour tests)

```typescript
import { GeminiAdapter } from './GeminiAdapter';

const gemini = new GeminiAdapter('AIzaSy...', 'gemini-1.5-pro');
const result = await gemini.analyzeSyntax('Mon texte');
```

## 📝 Interface IAIServicePort

Tous les adapters implémentent ces méthodes :

```typescript
interface IAIServicePort {
  // Analyse syntaxique (grammaire, orthographe)
  analyzeSyntax(text: string): Promise<SyntaxAnalysisResult>;
  
  // Analyse de style (ton, vocabulaire)
  analyzeStyle(
    text: string, 
    targetStyle: WritingStyle
  ): Promise<StyleAnalysisResult>;
  
  // Suggestions de progression narrative
  suggestProgression(
    text: string, 
    style: WritingStyle, 
    context?: string
  ): Promise<ProgressionSuggestionResult>;
  
  // Génération de résumé
  summarize(text: string, maxWords: number): Promise<string>;
}
```

## 🆕 Ajouter un nouvel adapter

### 1. Créer le fichier adapter

```typescript
// src/modules/ai-assistant/infrastructure/ai/MonAdapter.ts

import { IAIServicePort, ... } from '@modules/ai-assistant/domain/repositories/IAIServicePort';

export class MonAdapter implements IAIServicePort {
  private client: MonClient;
  private model: string;

  constructor(apiKey: string, model: string = 'default-model') {
    this.client = new MonClient({ apiKey });
    this.model = model;
  }

  async analyzeSyntax(text: string): Promise<SyntaxAnalysisResult> {
    // Implémentation
  }

  // ... autres méthodes
}
```

### 2. Mettre à jour les types

```typescript
// src/shared/types/index.ts

export type AIProvider = 'openai' | 'claude' | 'mistral' | 'ollama' | 'gemini' | 'mon-provider';
```

### 3. Mettre à jour le Factory

```typescript
// AIAdapterFactory.ts

import { MonAdapter } from './MonAdapter';

// Dans create():
case 'mon-provider':
  return new MonAdapter(config.apiKey, config.model);

// Dans getApiKeyForProvider():
case 'mon-provider':
  return process.env.MON_PROVIDER_API_KEY;

// Dans getModelForProvider():
case 'mon-provider':
  return process.env.MON_PROVIDER_MODEL || 'default-model';
```

### 4. Créer les tests

```typescript
// tests/unit/modules/ai-assistant/infrastructure/ai/MonAdapter.test.ts

describe('MonAdapter', () => {
  // Tests unitaires
});
```

### 5. Mettre à jour .env.example

```env
# Mon Provider
MON_PROVIDER_API_KEY="xxxxx"
MON_PROVIDER_MODEL="default-model"
```

## 📊 Comparaison des providers

| Provider | Gratuit | Vitesse | Français | JSON natif | Multimodal |
|----------|---------|---------|----------|------------|------------|
| **Gemini** | ✅ Généreux | ⚡⚡⚡ | ✅✅✅ | ❌ | ✅ |
| **Claude** | ❌ Limité | ⚡⚡ | ✅✅✅ | ❌ | ✅ |
| **OpenAI** | ❌ Payant | ⚡⚡ | ✅✅ | ✅ | ✅ |
| **Mistral** | ⏳ | ⏳ | ✅✅✅ | ⏳ | ⏳ |
| **Ollama** | ✅ Local | ⚡ | ✅ | ❌ | ✅ |

## 🧪 Tests

```bash
# Tests unitaires de tous les adapters
npm run test:unit -- ai-assistant/infrastructure/ai

# Test d'un adapter spécifique
npm run test:unit -- GeminiAdapter.test.ts
```

## 🔍 Debugging

### Activer les logs détaillés

```typescript
// Dans votre adapter
console.log('Prompt envoyé:', prompt);
console.log('Réponse brute:', response);
```

### Tester un provider manuellement

```typescript
// scripts/test-provider.ts
import { GeminiAdapter } from './src/modules/ai-assistant/infrastructure/ai/GeminiAdapter';

const adapter = new GeminiAdapter(process.env.GEMINI_API_KEY!);
const result = await adapter.analyzeSyntax('Test');
console.log(result);
```

## 📚 Documentation

- [Configuration Gemini](../../../../docs/configuration-gemini.md)
- [Guide de démarrage rapide](../../../../docs/guide-demarrage-gemini.md)
- [Architecture générale](../../../../docs/architecture.md)

## 🤝 Contribution

Pour ajouter un nouveau provider :

1. Créer l'adapter en implémentant `IAIServicePort`
2. Ajouter les tests unitaires
3. Mettre à jour le factory
4. Documenter dans `.env.example`
5. Créer un guide dans `docs/`

---

**Dernière mise à jour:** Février 2026  
**Mainteneur:** Équipe Alfred
