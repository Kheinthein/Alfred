import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { DeleteBook } from '@modules/book/domain/use-cases/DeleteBook';
import { UpdateBook } from '@modules/book/domain/use-cases/UpdateBook';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UpdateBookDTOSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').optional(),
  description: z.string().optional().nullable(),
});

/**
 * GET /api/books/[id]
 * Récupère un livre avec ses chapitres
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Récupérer le livre avec ses documents
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        documents: {
          where: { deletedAt: null },
          include: {
            style: true,
          },
          orderBy: [{ chapterOrder: 'asc' }, { createdAt: 'asc' }],
        },
        _count: {
          select: { documents: { where: { deletedAt: null } } },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Livre non trouvé',
          },
        },
        { status: 404 }
      );
    }

    // 3. Vérifier les permissions
    if (book.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: "Vous n'avez pas la permission d'accéder à ce livre",
          },
        },
        { status: 403 }
      );
    }

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        book: {
          id: book.id,
          title: book.title,
          description: book.description,
          sortOrder: Number(book.sortOrder),
          chapterCount: book._count.documents,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
          chapters: book.documents.map((doc) => ({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            wordCount: doc.wordCount,
            style: {
              id: doc.style.id,
              name: doc.style.name,
            },
            version: doc.version,
            chapterOrder: doc.chapterOrder ? Number(doc.chapterOrder) : null,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          })),
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/books/[id]
 * Met à jour un livre
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Parser et valider le body
    const body: unknown = await request.json();
    const data = UpdateBookDTOSchema.parse(body);

    // 3. Mettre à jour le livre
    const updateBook = container.get<UpdateBook>(UpdateBook);
    const result = await updateBook.execute({
      id,
      userId,
      title: data.title,
      description: data.description,
    });

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        book: {
          id: result.book.id,
          title: result.book.title,
          description: result.book.description,
          sortOrder: result.book.sortOrder,
          createdAt: result.book.createdAt,
          updatedAt: result.book.updatedAt,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/books/[id]
 * Supprime un livre
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Supprimer le livre
    const deleteBook = container.get<DeleteBook>(DeleteBook);
    await deleteBook.execute({
      id,
      userId,
    });

    // 3. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: { message: 'Livre supprimé' },
    });
  } catch (error) {
    return handleError(error);
  }
}
