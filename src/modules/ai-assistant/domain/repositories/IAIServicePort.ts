import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';

/**
 * Résultat d'analyse syntaxique
 */
export interface SyntaxAnalysisResult {
  errors: Array<{
    message: string;
    position?: number;
  }>;
  suggestions: string[];
  confidence: number;
}

/**
 * Résultat d'analyse de style
 */
export interface StyleAnalysisResult {
  tone: string;
  vocabulary: string;
  suggestions: string[];
  alignmentScore: number; // 0-1
}

/**
 * Résultat de suggestion de progression
 */
export interface ProgressionSuggestionResult {
  suggestions: string[];
  reasoning: string;
  alternatives: string[];
}

/**
 * Message pour le chat avec l'IA
 */
export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Port (interface) pour les services d'IA
 * Le domaine définit QUOI faire, pas COMMENT
 * Les implémentations concrètes (Claude, OpenAI, etc.) sont dans l'infrastructure
 */
export interface IAIServicePort {
  /**
   * Analyse la syntaxe d'un texte
   */
  analyzeSyntax(text: string): Promise<SyntaxAnalysisResult>;

  /**
   * Analyse le style d'écriture par rapport à un style cible
   */
  analyzeStyle(
    text: string,
    targetStyle: WritingStyle
  ): Promise<StyleAnalysisResult>;

  /**
   * Suggère une progression narrative
   */
  suggestProgression(
    text: string,
    style: WritingStyle,
    context?: string
  ): Promise<ProgressionSuggestionResult>;

  /**
   * Génère un résumé du texte
   */
  summarize(text: string, maxWords: number): Promise<string>;

  /**
   * Conversation libre avec l'IA, en contexte d'un document
   * @param messages - historique de la conversation
   * @param documentContext - contenu du document actuel (pour personnaliser les réponses)
   */
  chat(messages: AIChatMessage[], documentContext: string): Promise<string>;
}
