import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/container';
import { AnalyzeText } from '@modules/ai-assistant/domain/use-cases/AnalyzeText';
import { AnalyzeTextDTOSchema } from '@modules/ai-assistant/application/dtos/AnalyzeTextDTO';
import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import {
  rateLimitMiddleware,
  rateLimitByUser,
  RATE_LIMIT_CONFIGS,
} from '@/app/api/middleware/rateLimit';
import { logger } from '@shared/infrastructure/logger/WinstonLogger';

/**
 * POST /api/ai/analyze
 * Analyse un document avec l'IA
 * Rate limit: 10 requêtes par minute
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    // 1. Rate limit par IP (brute-force avant auth)
    const rateLimitResponse = rateLimitMiddleware(
      request,
      RATE_LIMIT_CONFIGS.ai
    );
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Authentifier
    const { userId } = authenticateRequest(request);

    // 3. Rate limit par userId : 10 analyses/minute (cahier des charges §2.7.2)
    if (
      process.env.NODE_ENV !== 'development' &&
      process.env.NODE_ENV !== 'test'
    ) {
      const { allowed, retryAfter } = rateLimitByUser(
        userId,
        RATE_LIMIT_CONFIGS.ai
      );
      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message:
                'Limite de 10 analyses par minute atteinte. Veuillez patienter.',
              retryAfter,
            },
          },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
      }
    }

    // 4. Parser et valider le body
    const body: unknown = await request.json();
    const data = AnalyzeTextDTOSchema.parse(body);

    // 5. Analyser le document
    const analyzeText = container.get<AnalyzeText>(AnalyzeText);
    const result = await analyzeText.execute({
      documentId: data.documentId,
      userId,
      analysisType: data.analysisType,
    });

    // 6. Logger l'analyse
    const duration = performance.now() - startTime;
    logger.info({
      action: 'ai.analyze',
      userId,
      documentId: data.documentId,
      analysisType: data.analysisType,
      confidence: result.confidence,
      duration,
    });

    // 7. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        analysis: {
          id: result.analysis.id,
          type: result.analysis.type,
          suggestions: result.analysis.suggestions,
          confidence: result.analysis.confidence,
          createdAt: result.analysis.createdAt,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        processingTime: `${Math.round(duration)}ms`,
      },
    });
  } catch (error) {
    const duration = performance.now() - startTime;

    // Log détaillé de l'erreur
    console.error('❌ Erreur analyse IA:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      error: error,
    });

    logger.error({
      action: 'ai.analyze.error',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      duration,
    });

    return handleError(error);
  }
}
