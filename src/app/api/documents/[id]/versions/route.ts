import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { IDocumentVersionRepository } from '@modules/document/domain/repositories/IDocumentVersionRepository';
import { UpdateDocument } from '@modules/document/domain/use-cases/UpdateDocument';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RestoreSchema = z.object({ version: z.number().int().positive() });

/**
 * GET /api/documents/[id]/versions
 * Retourne l'historique des versions d'un document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;

    const docRepo = container.get<IDocumentRepository>('IDocumentRepository');
    const doc = await docRepo.findById(id);

    if (!doc || doc.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Document non trouvé' },
        },
        { status: 404 }
      );
    }

    const versionRepo = container.get<IDocumentVersionRepository>(
      'IDocumentVersionRepository'
    );
    const versions = await versionRepo.findByDocumentId(id);

    return NextResponse.json({
      success: true,
      data: {
        currentVersion: doc.version,
        versions: versions.map((v) => ({
          version: v.version,
          title: v.title,
          wordCount: v.wordCount,
          createdAt: v.createdAt,
          // On n'envoie pas le contenu complet dans la liste
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/documents/[id]/versions/restore
 * Restaure une version précédente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;
    const body: unknown = await request.json();
    const { version } = RestoreSchema.parse(body);

    const versionRepo = container.get<IDocumentVersionRepository>(
      'IDocumentVersionRepository'
    );
    const snapshot = await versionRepo.findByVersion(id, version);

    if (!snapshot) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Version non trouvée' },
        },
        { status: 404 }
      );
    }

    // Restaurer via UpdateDocument (sauvegarde automatiquement la version courante)
    const updateDocument = container.get<UpdateDocument>(UpdateDocument);
    const result = await updateDocument.execute({
      documentId: id,
      userId,
      title: snapshot.title,
      content: snapshot.content,
    });

    return NextResponse.json({
      success: true,
      data: {
        document: {
          id: result.document.id,
          title: result.document.title,
          content: result.document.content.text,
          wordCount: result.document.content.wordCount,
          version: result.document.version,
        },
        restoredFrom: version,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
