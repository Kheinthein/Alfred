import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de rate limiting pour protéger les endpoints contre les abus
 *
 * Implémentation simple en mémoire (pour production, utiliser Redis)
 */

interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxRequests: number; // Nombre maximum de requêtes dans la fenêtre
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// Store en mémoire pour les compteurs de requêtes
// ⚠️ En production, utiliser Redis pour le partage entre instances
const requestStore = new Map<string, RequestRecord>();

// Nettoyage périodique des anciennes entrées
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    if (record.resetTime < now) {
      requestStore.delete(key);
    }
  }
}, 60000); // Nettoyage toutes les minutes

/**
 * Extrait l'identifiant du client (IP uniquement — pour le rate limit par userId,
 * utiliser rateLimitByUser() après authentification)
 */
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] ?? realIp ?? 'unknown';
  return `ip:${ip}`;
}

/**
 * Rate limit par userId authentifié (plus précis que par IP)
 */
export function rateLimitByUser(
  userId: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter: number } {
  const identifier = `user:${userId}`;
  const { allowed, resetTime } = checkRateLimit(identifier, config);
  const retryAfter = allowed ? 0 : Math.ceil((resetTime - Date.now()) / 1000);
  return { allowed, retryAfter };
}

/**
 * Vérifie si la requête dépasse le rate limit
 */
function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime: number; remaining: number } {
  const now = Date.now();
  const record = requestStore.get(identifier);

  // Première requête ou fenêtre expirée
  if (!record || record.resetTime < now) {
    const resetTime = now + config.windowMs;
    requestStore.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      resetTime,
      remaining: config.maxRequests - 1,
    };
  }

  // Incrémenter le compteur
  record.count++;

  // Vérifier si la limite est dépassée
  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      resetTime: record.resetTime,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    resetTime: record.resetTime,
    remaining: config.maxRequests - record.count,
  };
}

/**
 * Configurations prédéfinies
 */
export const RATE_LIMIT_CONFIGS = {
  // Rate limit standard pour les API générales
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Rate limit strict pour les endpoints IA (coûteux)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  // Rate limit pour l'authentification (prévenir brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
} as const;

/**
 * Middleware de rate limiting
 *
 * @param request - NextRequest
 * @param config - Configuration du rate limit
 * @returns NextResponse si rate limit dépassé, null sinon
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMIT_CONFIGS.ai);
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // ... logique de l'endpoint
 * }
 * ```
 */
export function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.standard
): NextResponse | null {
  // Désactiver le rate limiting en mode test, CI, ou développement local
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    process.env.PLAYWRIGHT_TEST === 'true' ||
    process.env.NODE_ENV === 'development'
  ) {
    return null;
  }

  const identifier = getClientIdentifier(request);
  const { allowed, resetTime, remaining } = checkRateLimit(identifier, config);

  // Ajouter les headers de rate limit (standard RFC 6585)
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter,
        },
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Rate limit OK, mais on ne peut pas ajouter les headers ici
  // (ils seront ajoutés dans la réponse de l'endpoint)
  return null;
}

/**
 * Helper pour ajouter les headers de rate limit à une réponse
 */
export function addRateLimitHeaders(
  response: NextResponse,
  identifier: string,
  config: RateLimitConfig
): NextResponse {
  const record = requestStore.get(identifier);
  if (!record) return response;

  const remaining = Math.max(0, config.maxRequests - record.count);

  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    new Date(record.resetTime).toISOString()
  );

  return response;
}

/**
 * Réinitialiser le rate limit pour un identifiant (utile pour les tests)
 */
export function resetRateLimit(identifier?: string): void {
  if (identifier) {
    requestStore.delete(identifier);
  } else {
    requestStore.clear();
  }
}
