import { NextResponse } from 'next/server';
import { AppError } from '@shared/errors';
import { logger } from '@shared/infrastructure/logger/WinstonLogger';
import { ZodError } from 'zod';

/**
 * Génère un identifiant court et unique pour corréler une erreur HTTP
 * avec l'entrée correspondante dans les logs serveur.
 */
function generateErrorId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Détecte si on doit exposer les détails techniques.
 * - Toujours en développement / test
 * - En production seulement si EXPOSE_ERROR_DETAILS=true
 *   (utile pour diagnostiquer un serveur déployé sans accès SSH).
 */
function shouldExposeDetails(): boolean {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    return true;
  }
  return process.env.EXPOSE_ERROR_DETAILS === 'true';
}

/**
 * Handler global des erreurs pour les API routes.
 * Transforme les erreurs en réponses JSON structurées et loggue avec un errorId.
 */
export function handleError(error: unknown): NextResponse {
  const errorId = generateErrorId();

  logger.error({
    errorId,
    error: error instanceof Error ? error.message : 'Unknown error',
    name: error instanceof Error ? error.name : undefined,
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Erreur de validation',
          errorId,
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.constructor.name,
          message: error.message,
          errorId,
        },
      },
      { status: error.statusCode }
    );
  }

  const expose = shouldExposeDetails();
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  const errorMessage = error instanceof Error ? error.message : String(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Une erreur interne est survenue',
        errorId,
        ...(expose && {
          debug: {
            name: errorName,
            originalMessage: errorMessage,
          },
        }),
      },
    },
    { status: 500 }
  );
}
