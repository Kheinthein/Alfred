import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/stats
 * Statistiques d'écriture de l'utilisateur
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalDocuments,
      totalBooks,
      totalWordsResult,
      documentsThisMonth,
      recentDocuments,
      topStyle,
    ] = await Promise.all([
      // Nombre total de documents actifs
      prisma.document.count({ where: { userId, deletedAt: null } }),

      // Nombre total de livres
      prisma.book.count({ where: { userId } }),

      // Total des mots écrits
      prisma.document.aggregate({
        where: { userId, deletedAt: null },
        _sum: { wordCount: true },
      }),

      // Documents créés ce mois-ci
      prisma.document.count({
        where: { userId, deletedAt: null, createdAt: { gte: startOfMonth } },
      }),

      // Activité sur 30 jours (par semaine)
      prisma.document.findMany({
        where: { userId, deletedAt: null, updatedAt: { gte: thirtyDaysAgo } },
        select: { updatedAt: true, wordCount: true },
        orderBy: { updatedAt: 'asc' },
      }),

      // Style le plus utilisé
      prisma.document.groupBy({
        by: ['styleId'],
        where: { userId, deletedAt: null },
        _count: { styleId: true },
        orderBy: { _count: { styleId: 'desc' } },
        take: 1,
      }),
    ]);

    // Calcul des mots par semaine sur 30 jours (4 semaines)
    const weeklyWords: { week: string; words: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(
        now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000
      );
      const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const weekDocs = recentDocuments.filter(
        (d) => d.updatedAt >= weekStart && d.updatedAt < weekEnd
      );
      const words = weekDocs.reduce((acc, d) => acc + d.wordCount, 0);
      const label = `S${4 - w}`;
      weeklyWords.push({ week: label, words });
    }

    // Récupérer le nom du style le plus utilisé
    let topStyleName: string | null = null;
    if (topStyle.length > 0) {
      const style = await prisma.writingStyle.findUnique({
        where: { id: topStyle[0].styleId },
        select: { name: true },
      });
      topStyleName = style?.name ?? null;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalDocuments,
        totalBooks,
        totalWords: totalWordsResult._sum.wordCount ?? 0,
        documentsThisMonth,
        weeklyWords,
        topStyleName,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
