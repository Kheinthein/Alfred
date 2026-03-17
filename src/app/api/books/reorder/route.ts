import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { ReorderBooks } from '@modules/book/domain/use-cases/ReorderBooks';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ReorderBooksDTOSchema = z.object({
  bookIds: z.array(z.string()).min(1, 'La liste des IDs est requise'),
});

/**
 * PUT /api/books/reorder
 * Réorganise l'ordre des livres
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Parser et valider le body
    const body: unknown = await request.json();
    const data = ReorderBooksDTOSchema.parse(body);

    // 3. Réorganiser les livres
    const reorderBooks = container.get<ReorderBooks>(ReorderBooks);
    await reorderBooks.execute({
      userId,
      bookIds: data.bookIds,
    });

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: { message: 'Ordre des livres mis à jour' },
    });
  } catch (error) {
    return handleError(error);
  }
}
