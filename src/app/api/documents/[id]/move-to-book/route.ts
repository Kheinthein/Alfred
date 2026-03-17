import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { MoveDocumentToBook } from '@modules/document/domain/use-cases/MoveDocumentToBook';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const MoveDocumentToBookDTOSchema = z.object({
  bookId: z.string().nullable(),
  chapterOrder: z.number().nullable().optional(),
});

/**
 * POST /api/documents/[id]/move-to-book
 * Déplace un document dans un livre (ou le retire d'un livre)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Parser et valider le body
    const body: unknown = await request.json();
    const data = MoveDocumentToBookDTOSchema.parse(body);

    // 3. Déplacer le document
    const moveDocumentToBook =
      container.get<MoveDocumentToBook>(MoveDocumentToBook);
    await moveDocumentToBook.execute({
      documentId: id,
      userId,
      bookId: data.bookId,
      chapterOrder: data.chapterOrder ?? null,
    });

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: { message: 'Document déplacé' },
    });
  } catch (error) {
    return handleError(error);
  }
}
