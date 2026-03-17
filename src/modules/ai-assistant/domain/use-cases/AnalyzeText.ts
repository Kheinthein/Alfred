import { IAIServicePort } from '../repositories/IAIServicePort';
import { IAIAnalysisRepository } from '../repositories/IAIAnalysisRepository';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { AIAnalysis } from '../entities/AIAnalysis';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@shared/errors';
import { AnalysisType } from '@shared/types';

export interface AnalyzeTextInput {
  documentId: string;
  userId: string;
  analysisType: AnalysisType;
}

export interface AnalyzeTextOutput {
  analysis: AIAnalysis;
  suggestions: string[];
  confidence: number;
}

/**
 * Use Case : Analyser un document avec l'IA
 *
 * Responsabilités:
 * - Récupérer le document
 * - Vérifier les permissions
 * - Appeler le service IA approprié
 * - Sauvegarder l'analyse
 * - Retourner les résultats structurés
 */
export class AnalyzeText {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly aiService: IAIServicePort,
    private readonly aiAnalysisRepository: IAIAnalysisRepository
  ) {}

  /** Hash rapide du contenu pour identifier les analyses identiques */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Conversion en 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async execute(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
    // 1. Récupérer le document
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // 2. Vérifier les permissions
    if (document.userId !== input.userId) {
      throw new UnauthorizedError(
        "Vous n'avez pas la permission d'analyser ce document"
      );
    }

    // 3. Vérifier le cache (même contenu + même type < 7 jours)
    const contentHash = this.hashContent(document.content.text);
    const cached = await this.aiAnalysisRepository.findCachedAnalysis(
      input.documentId,
      input.analysisType,
      contentHash
    );
    if (cached) {
      return {
        analysis: cached,
        suggestions: cached.suggestions,
        confidence: cached.confidence,
      };
    }

    // 4. Analyser selon le type demandé
    let suggestions: string[];
    let confidence: number;

    switch (input.analysisType) {
      case 'syntax': {
        const result = await this.aiService.analyzeSyntax(
          document.content.text
        );
        suggestions = result.suggestions;
        confidence = result.confidence;
        break;
      }

      case 'style': {
        const result = await this.aiService.analyzeStyle(
          document.content.text,
          document.style
        );
        suggestions = result.suggestions;
        confidence = result.alignmentScore;
        break;
      }

      case 'progression': {
        const result = await this.aiService.suggestProgression(
          document.content.text,
          document.style
        );
        suggestions = result.suggestions;
        confidence = 0.85; // Score par défaut pour suggestions narratives
        break;
      }

      default: {
        const exhaustiveCheck: never = input.analysisType;
        throw new ValidationError(
          `Type d'analyse non supporté: ${String(exhaustiveCheck)}`
        );
      }
    }

    // 5. Créer l'entité AIAnalysis (avec hash pour le cache futur)
    const analysis = new AIAnalysis(
      this.generateId(),
      document.id,
      input.analysisType,
      suggestions,
      confidence,
      new Date(),
      { contentHash }
    );

    // 6. Valider l'analyse
    analysis.validate();

    // 7. Sauvegarder l'analyse pour historique
    await this.aiAnalysisRepository.save(analysis);

    return {
      analysis,
      suggestions,
      confidence,
    };
  }

  private generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
