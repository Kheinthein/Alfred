import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/documents/trash
 * Récupère les documents en corbeille de l'utilisateur
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);

    const documentRepo = container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    const documents = await documentRepo.findDeletedByUserId(userId);

    return NextResponse.json({
      success: true,
      data: {
        documents: documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          wordCount: doc.content.wordCount,
          style: { id: doc.style.id, name: doc.style.name },
          version: doc.version,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
