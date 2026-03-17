/* eslint-disable @typescript-eslint/unbound-method */

import { IAIAnalysisRepository } from '@modules/ai-assistant/domain/repositories/IAIAnalysisRepository';
import { IAIServicePort } from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { AnalyzeText } from '@modules/ai-assistant/domain/use-cases/AnalyzeText';
import { Document } from '@modules/document/domain/entities/Document';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { DocumentContent } from '@modules/document/domain/value-objects/DocumentContent';
import { NotFoundError, UnauthorizedError } from '@shared/errors';
import { AnalysisType } from '@shared/types';

describe('AnalyzeText Use Case', () => {
  let analyzeText: AnalyzeText;
  let mockAIService: jest.Mocked<IAIServicePort>;
  let mockAIAnalysisRepo: jest.Mocked<IAIAnalysisRepository>;
  let mockDocumentRepo: jest.Mocked<IDocumentRepository>;
  let mockDocument: Document;
  let mockStyle: WritingStyle;

  beforeEach(() => {
    mockAIService = {
      analyzeSyntax: jest.fn(),
      analyzeStyle: jest.fn(),
      suggestProgression: jest.fn(),
      summarize: jest.fn(),
      chat: jest.fn(),
    };

    mockAIAnalysisRepo = {
      save: jest.fn(),
      findByDocumentId: jest.fn(),
      findLatestByDocumentAndType: jest.fn(),
      findCachedAnalysis: jest.fn().mockResolvedValue(null), // pas de cache par défaut
      deleteByDocumentId: jest.fn(),
    };

    mockDocumentRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findDeletedByUserId: jest.fn(),
      findByIdIncludeDeleted: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      delete: jest.fn(),
      countByUserId: jest.fn(),
      updateSortOrders: jest.fn(),
    };

    mockStyle = new WritingStyle('style-1', 'Roman', 'Style roman');
    mockDocument = new Document(
      'doc-123',
      'user-456',
      'Mon Document',
      new DocumentContent('Il était une fois dans un royaume lointain...'),
      mockStyle,
      1,
      new Date(),
      new Date()
    );

    analyzeText = new AnalyzeText(
      mockDocumentRepo,
      mockAIService,
      mockAIAnalysisRepo
    );
  });

  describe('Analyse syntaxique', () => {
    it('devrait analyser la syntaxe avec succès', async () => {
      mockDocumentRepo.findById.mockResolvedValue(mockDocument);
      mockAIService.analyzeSyntax.mockResolvedValue({
        errors: [],
        suggestions: ['Excellent texte !'],
        confidence: 0.95,
      });
      mockAIAnalysisRepo.save.mockResolvedValue();

      const result = await analyzeText.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        analysisType: 'syntax',
      });

      expect(result.analysis.suggestions).toContain('Excellent texte !');
      expect(result.analysis.confidence).toBe(0.95);
      expect(mockAIService.analyzeSyntax).toHaveBeenCalledWith(
        mockDocument.content.text
      );
      expect(mockAIAnalysisRepo.save).toHaveBeenCalled();
    });

    it('devrait retourner le résultat en cache si disponible', async () => {
      mockDocumentRepo.findById.mockResolvedValue(mockDocument);
      const cachedAnalysis = {
        id: 'analysis-cached',
        documentId: 'doc-123',
        type: 'syntax' as AnalysisType,
        suggestions: ['Suggestion depuis le cache'],
        confidence: 0.9,
        createdAt: new Date(),
        metadata: {},
      };
      mockAIAnalysisRepo.findCachedAnalysis.mockResolvedValue(
        cachedAnalysis as never
      );

      const result = await analyzeText.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        analysisType: 'syntax',
      });

      expect(result.analysis.suggestions).toContain(
        'Suggestion depuis le cache'
      );
      // L'IA ne doit PAS être appelée si on a un cache
      expect(mockAIService.analyzeSyntax).not.toHaveBeenCalled();
    });
  });

  describe('Analyse de style', () => {
    it('devrait analyser le style avec succès', async () => {
      mockDocumentRepo.findById.mockResolvedValue(mockDocument);
      mockAIService.analyzeStyle.mockResolvedValue({
        tone: 'Narratif',
        vocabulary: 'Soutenu',
        suggestions: ['Bien aligné avec le style roman'],
        alignmentScore: 0.9,
      });
      mockAIAnalysisRepo.save.mockResolvedValue();

      const result = await analyzeText.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        analysisType: 'style',
      });

      expect(result.analysis.suggestions).toContain(
        'Bien aligné avec le style roman'
      );
      expect(mockAIService.analyzeStyle).toHaveBeenCalledWith(
        mockDocument.content.text,
        mockDocument.style
      );
    });
  });

  describe('Suggestion de progression', () => {
    it('devrait suggérer une progression narrative', async () => {
      mockDocumentRepo.findById.mockResolvedValue(mockDocument);
      mockAIService.suggestProgression.mockResolvedValue({
        suggestions: ['Développer le personnage principal'],
        reasoning: 'Le récit manque de profondeur',
        alternatives: ['Ajouter un conflit'],
      });
      mockAIAnalysisRepo.save.mockResolvedValue();

      const result = await analyzeText.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        analysisType: 'progression',
      });

      expect(result.analysis.suggestions).toContain(
        'Développer le personnage principal'
      );
      expect(mockAIService.suggestProgression).toHaveBeenCalledWith(
        mockDocument.content.text,
        mockDocument.style
      );
    });
  });

  describe('Erreurs', () => {
    it("devrait rejeter si le document n'existe pas", async () => {
      mockDocumentRepo.findById.mockResolvedValue(null);

      await expect(
        analyzeText.execute({
          documentId: 'doc-999',
          userId: 'user-456',
          analysisType: 'syntax',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("devrait rejeter si l'utilisateur n'a pas les permissions", async () => {
      mockDocumentRepo.findById.mockResolvedValue(mockDocument);

      await expect(
        analyzeText.execute({
          documentId: 'doc-123',
          userId: 'user-999',
          analysisType: 'syntax',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("devrait rejeter un type d'analyse invalide", async () => {
      mockDocumentRepo.findById.mockResolvedValue(mockDocument);

      await expect(
        analyzeText.execute({
          documentId: 'doc-123',
          userId: 'user-456',
          analysisType: 'invalid' as unknown as AnalysisType,
        })
      ).rejects.toThrow("Type d'analyse non supporté");
    });
  });
});
