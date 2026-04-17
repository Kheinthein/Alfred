import { NextResponse } from 'next/server';
import { container } from '@/container';
import { IAIServicePort } from '@modules/ai-assistant/domain/repositories/IAIServicePort';

/**
 * GET /api/health/ai
 * Diagnostic du provider IA en production.
 * Vérifie :
 *  - Présence des variables d'environnement
 *  - Instanciation du service IA (container)
 *  - Appel réel à l'IA (summarize court) pour valider la clé API
 *
 * ⚠️ Ne retourne JAMAIS la clé API, uniquement des booléens / longueurs.
 */
export async function GET(): Promise<NextResponse> {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      AI_PROVIDER: process.env.AI_PROVIDER ?? null,
      GEMINI_MODEL: process.env.GEMINI_MODEL ?? null,
      GEMINI_API_KEY_present: Boolean(process.env.GEMINI_API_KEY),
      GEMINI_API_KEY_length: process.env.GEMINI_API_KEY?.length ?? 0,
      OPENAI_API_KEY_present: Boolean(process.env.OPENAI_API_KEY),
      ANTHROPIC_API_KEY_present: Boolean(process.env.ANTHROPIC_API_KEY),
      DATABASE_URL_present: Boolean(process.env.DATABASE_URL),
      JWT_SECRET_present: Boolean(process.env.JWT_SECRET),
    },
  };

  // 1. Tenter d'instancier le service IA
  let aiService: IAIServicePort;
  try {
    aiService = container.get<IAIServicePort>('IAIServicePort');
    diagnostics.containerResolved = true;
  } catch (error) {
    diagnostics.containerResolved = false;
    diagnostics.containerError =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: 'error', step: 'container', diagnostics },
      { status: 500 }
    );
  }

  // 2. Tester un appel réel à l'IA (très court pour économiser les tokens)
  try {
    const start = performance.now();
    const result = await aiService.summarize(
      'Bonjour Alfred, ceci est un test de diagnostic.',
      10
    );
    const durationMs = Math.round(performance.now() - start);

    diagnostics.aiCall = {
      success: true,
      durationMs,
      responsePreview: result.substring(0, 100),
    };

    return NextResponse.json({ status: 'ok', diagnostics });
  } catch (error) {
    diagnostics.aiCall = {
      success: false,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
    return NextResponse.json(
      { status: 'error', step: 'aiCall', diagnostics },
      { status: 500 }
    );
  }
}
