import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { CreateDocumentDTOSchema } from '@modules/document/application/dtos/CreateDocumentDTO';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import { CreateDocument } from '@modules/document/domain/use-cases/CreateDocument';
import { GetUserDocuments } from '@modules/document/domain/use-cases/GetUserDocuments';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/documents
 * Récupère tous les documents de l'utilisateur authentifié
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Lire les filtres optionnels
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') ?? undefined;
    const tagId = searchParams.get('tagId') ?? undefined;
    const styleId = searchParams.get('styleId') ?? undefined;
    const sortField = (searchParams.get('sortField') ?? undefined) as
      | import('@modules/document/domain/repositories/IDocumentRepository').DocumentSortField
      | undefined;
    const sortOrder = (searchParams.get('sortOrder') ?? undefined) as
      | import('@modules/document/domain/repositories/IDocumentRepository').DocumentSortOrder
      | undefined;

    // 3. Récupérer les documents
    const getUserDocuments = container.get<GetUserDocuments>(GetUserDocuments);
    const result = await getUserDocuments.execute({
      userId,
      search,
      tagId,
      styleId,
      sortField,
      sortOrder,
    });

    // 3. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        documents: result.documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          content: doc.content.text,
          wordCount: doc.content.wordCount,
          style: {
            id: doc.style.id,
            name: doc.style.name,
          },
          version: doc.version,
          sortOrder: doc.sortOrder,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/documents
 * Crée un nouveau document
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Parser et valider le body
    const body: unknown = await request.json();
    console.log('📝 Body reçu pour création document:', body);

    const data = CreateDocumentDTOSchema.parse(body);
    console.log('✅ Validation passée:', data);

    // 3. Récupérer le style
    const styleData = await prisma.writingStyle.findUnique({
      where: { id: data.styleId },
    });

    if (!styleData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: "Style d'écriture non trouvé",
          },
        },
        { status: 404 }
      );
    }

    const style = new WritingStyle(
      styleData.id,
      styleData.name,
      styleData.description
    );

    // 4. Créer le document
    const createDocument = container.get<CreateDocument>(CreateDocument);
    const result = await createDocument.execute({
      userId,
      title: data.title,
      content: data.content,
      style,
    });

    // 5. Retourner la réponse
    return NextResponse.json(
      {
        success: true,
        data: {
          document: {
            id: result.document.id,
            title: result.document.title,
            content: result.document.content.text,
            wordCount: result.document.content.wordCount,
            style: {
              id: result.document.style.id,
              name: result.document.style.name,
            },
            version: result.document.version,
            sortOrder: result.document.sortOrder,
            createdAt: result.document.createdAt,
            updatedAt: result.document.updatedAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
