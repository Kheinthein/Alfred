import { AIAnalysis } from '@modules/ai-assistant/domain/entities/AIAnalysis';
import { IAIAnalysisRepository } from '@modules/ai-assistant/domain/repositories/IAIAnalysisRepository';
import { PrismaClient } from '@prisma/client';
import { AnalysisType } from '@shared/types';

/**
 * Implémentation du repository AIAnalysis avec Prisma
 */
export class AIAnalysisRepository implements IAIAnalysisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(analysis: AIAnalysis): Promise<void> {
    await this.prisma.aIAnalysis.create({
      data: {
        id: analysis.id,
        documentId: analysis.documentId,
        type: analysis.type,
        suggestions: JSON.stringify(analysis.suggestions),
        confidence: analysis.confidence,
        metadata: analysis.metadata ? JSON.stringify(analysis.metadata) : null,
        createdAt: analysis.createdAt,
      },
    });
  }

  async findByDocumentId(documentId: string): Promise<AIAnalysis[]> {
    const analyses = await this.prisma.aIAnalysis.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return analyses.map(
      (a: {
        id: string;
        documentId: string;
        type: string;
        suggestions: string;
        confidence: number;
        metadata: string | null;
        createdAt: Date;
      }) => this.toDomain(a)
    );
  }

  async findLatestByDocumentAndType(
    documentId: string,
    type: string
  ): Promise<AIAnalysis | null> {
    const analysis = await this.prisma.aIAnalysis.findFirst({
      where: { documentId, type },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) return null;

    return this.toDomain(analysis);
  }

  async findCachedAnalysis(
    documentId: string,
    type: string,
    contentHash: string
  ): Promise<AIAnalysis | null> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const analyses = await this.prisma.aIAnalysis.findMany({
      where: {
        documentId,
        type,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Chercher une analyse avec le même hash de contenu
    for (const a of analyses) {
      if (!a.metadata) continue;
      const meta = JSON.parse(a.metadata) as Record<string, unknown>;
      if (meta.contentHash === contentHash) {
        return this.toDomain(a);
      }
    }

    return null;
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prisma.aIAnalysis.deleteMany({
      where: { documentId },
    });
  }

  /**
   * Convertit un model Prisma en entité Domain
   */
  private toDomain(data: {
    id: string;
    documentId: string;
    type: string;
    suggestions: string;
    confidence: number;
    metadata: string | null;
    createdAt: Date;
  }): AIAnalysis {
    return new AIAnalysis(
      data.id,
      data.documentId,
      data.type as AnalysisType,
      JSON.parse(data.suggestions) as string[],
      data.confidence,
      data.createdAt,
      data.metadata
        ? (JSON.parse(data.metadata) as Record<string, unknown>)
        : undefined
    );
  }
}
