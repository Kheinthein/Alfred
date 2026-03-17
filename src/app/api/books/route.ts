import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { CreateBook } from '@modules/book/domain/use-cases/CreateBook';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateBookDTOSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional().nullable(),
});

/**
 * GET /api/books
 * Récupère tous les livres de l'utilisateur connecté
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Récupérer les livres
    const books = await prisma.book.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    // 3. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        books: books.map((book) => ({
          id: book.id,
          title: book.title,
          description: book.description,
          sortOrder: Number(book.sortOrder),
          chapterCount: book._count.documents,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/books
 * Crée un nouveau livre
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Parser et valider le body
    const body: unknown = await request.json();
    const data = CreateBookDTOSchema.parse(body);

    // 3. Créer le livre
    const createBook = container.get<CreateBook>(CreateBook);
    const result = await createBook.execute({
      userId,
      title: data.title,
      description: data.description ?? null,
    });

    // 4. Retourner la réponse
    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
