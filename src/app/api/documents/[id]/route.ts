import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { UpdateDocumentDTOSchema } from '@modules/document/application/dtos/UpdateDocumentDTO';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { DeleteDocument } from '@modules/document/domain/use-cases/DeleteDocument';
import { UpdateDocument } from '@modules/document/domain/use-cases/UpdateDocument';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/documents/[id]
 * Récupère un document par ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Await params (Next.js 15 requirement)
    const { id } = await params;

    // 3. Récupérer le document
    const documentRepo = container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    const document = await documentRepo.findById(id);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document non trouvé',
          },
        },
        { status: 404 }
      );
    }

    // 3. Vérifier les permissions
    if (document.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Accès non autorisé à ce document',
          },
        },
        { status: 403 }
      );
    }

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        document: {
          id: document.id,
          title: document.title,
          content: document.content.text,
          wordCount: document.content.wordCount,
          style: {
            id: document.style.id,
            name: document.style.name,
            description: document.style.description,
          },
          version: document.version,
          sortOrder: document.sortOrder,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/documents/[id]
 * Met à jour un document
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // 1. Authentifier
    const { userId } = authenticateRequest(request);

    // 2. Await params (Next.js 15 requirement)
    const { id } = await params;

    // 3. Parser et valider le body
    const body: unknown = await request.json();
    const data = UpdateDocumentDTOSchema.parse(body);

    // 4. Mettre à jour le document
    const updateDocument = container.get<UpdateDocument>(UpdateDocument);
    const result = await updateDocument.execute({
      documentId: id,
      userId,
      title: data.title,
      content: data.content,
    });

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        document: {
          id: result.document.id,
          title: result.document.title,
          content: result.document.content.text,
          wordCount: result.document.content.wordCount,
          version: result.document.version,
          sortOrder: result.document.sortOrder,
          updatedAt: result.document.updatedAt,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/documents/[id]
 * Suppression logique (soft delete) — le document va en corbeille
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;

    const documentRepo = container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    const document = await documentRepo.findById(id);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Document non trouvé' },
        },
        { status: 404 }
      );
    }
    if (document.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Accès non autorisé' },
        },
        { status: 403 }
      );
    }

    await documentRepo.softDelete(id);

    return NextResponse.json({
      success: true,
      data: { message: 'Document déplacé dans la corbeille' },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/documents/[id]
 * Actions spéciales : restore (corbeille → actif) ou purge (suppression définitive)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;
    const body = (await request.json()) as { action: string };

    const documentRepo = container.get<IDocumentRepository>(
      'IDocumentRepository'
    );

    // Pour restore/purge on cherche aussi dans la corbeille
    const doc = await documentRepo.findByIdIncludeDeleted(id);

    if (!doc) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Document non trouvé' },
        },
        { status: 404 }
      );
    }
    if (doc.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Accès non autorisé' },
        },
        { status: 403 }
      );
    }

    if (body.action === 'restore') {
      await documentRepo.restore(id);
      return NextResponse.json({
        success: true,
        data: { message: 'Document restauré' },
      });
    }

    if (body.action === 'purge') {
      const deleteDocument = container.get<DeleteDocument>(DeleteDocument);
      await deleteDocument.execute({ documentId: id, userId });
      return NextResponse.json({
        success: true,
        data: { message: 'Document supprimé définitivement' },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Action inconnue' },
      },
      { status: 400 }
    );
  } catch (error) {
    return handleError(error);
  }
}
