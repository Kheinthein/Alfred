import { handleError } from '@/app/api/middleware/errorHandler';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/styles
 * Récupère tous les styles d'écriture disponibles
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Vérifier que DATABASE_URL est défini
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'DATABASE_URL non configuré. Vérifiez votre fichier .env',
          },
        },
        { status: 500 }
      );
    }

    const styles = await prisma.writingStyle.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        styles: styles.map(
          (style: {
            id: string;
            name: string;
            description: string | null;
          }) => ({
            id: style.id,
            name: style.name,
            description: style.description,
          })
        ),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
