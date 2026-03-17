import { IAIServicePort } from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { ClaudeAdapter } from './ClaudeAdapter';
import { OpenAIAdapter } from './OpenAIAdapter';
import { GeminiAdapter } from './GeminiAdapter';
import { AIProvider } from '@shared/types';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Factory pour créer le bon AI adapter selon la configuration
 * Pattern Factory + Dependency Inversion
 */
export class AIAdapterFactory {
  static create(config: AIConfig): IAIServicePort {
    switch (config.provider) {
      case 'claude':
        if (!config.apiKey) {
          throw new Error('Claude API key est requis');
        }
        return new ClaudeAdapter(config.apiKey, config.model);

      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key est requis');
        }
        return new OpenAIAdapter(config.apiKey, config.model);

      case 'gemini':
        if (!config.apiKey) {
          throw new Error('Gemini API key est requis');
        }
        return new GeminiAdapter(config.apiKey, config.model);

      case 'mistral':
        throw new Error('Mistral adapter pas encore implémenté');

      case 'ollama':
        throw new Error('Ollama adapter pas encore implémenté');

      default: {
        const exhaustiveCheck: never = config.provider;
        throw new Error(
          `Provider IA inconnu: ${String(exhaustiveCheck)}. Providers supportés: claude, openai, gemini`
        );
      }
    }
  }

  /**
   * Crée un adapter depuis les variables d'environnement
   */
  static createFromEnv(): IAIServicePort {
    const provider = process.env.AI_PROVIDER as AIProvider | undefined;

    // Si pas de provider configuré, on ne peut pas créer le service
    if (!provider) {
      throw new Error(
        'AI_PROVIDER non configuré dans .env. Définissez AI_PROVIDER (claude, openai, gemini, etc.)'
      );
    }

    const config: AIConfig = {
      provider,
      apiKey: this.getApiKeyForProvider(provider),
      model: this.getModelForProvider(provider),
    };

    return this.create(config);
  }

  private static getApiKeyForProvider(
    provider: AIProvider
  ): string | undefined {
    switch (provider) {
      case 'claude':
        return process.env.ANTHROPIC_API_KEY;
      case 'openai':
        return process.env.OPENAI_API_KEY;
      case 'gemini':
        return process.env.GEMINI_API_KEY;
      case 'mistral':
        return process.env.MISTRAL_API_KEY;
      case 'ollama':
        return undefined; // Pas besoin d'API key pour Ollama
      default: {
        const exhaustiveCheck: never = provider;
        void exhaustiveCheck;
        return undefined;
      }
    }
  }

  private static getModelForProvider(provider: AIProvider): string | undefined {
    switch (provider) {
      case 'claude':
        return process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
      case 'openai':
        return process.env.OPENAI_MODEL || 'gpt-4-turbo';
      case 'gemini':
        return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      case 'mistral':
        return process.env.MISTRAL_MODEL || 'mistral-large-latest';
      case 'ollama':
        return process.env.OLLAMA_MODEL || 'llama3.1';
      default: {
        const exhaustiveCheck: never = provider;
        void exhaustiveCheck;
        return undefined;
      }
    }
  }
}
