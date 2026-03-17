import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const TagsSchema = z.object({
  tagIds: z.array(z.string()),
});

/**
 * GET /api/documents/[id]/tags
 * Récupère les tags d'un document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;

    const doc = await prisma.document.findUnique({
      where: { id, deletedAt: null },
    });
    if (!doc || doc.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Document non trouvé' },
        },
        { status: 404 }
      );
    }

    const documentTags = await prisma.documentTag.findMany({
      where: { documentId: id },
      include: { tag: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        tags: documentTags.map((dt) => ({
          id: dt.tag.id,
          name: dt.tag.name,
          color: dt.tag.color,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/documents/[id]/tags
 * Remplace tous les tags d'un document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;
    const body: unknown = await request.json();
    const { tagIds } = TagsSchema.parse(body);

    const doc = await prisma.document.findUnique({
      where: { id, deletedAt: null },
    });
    if (!doc || doc.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Document non trouvé' },
        },
        { status: 404 }
      );
    }

    // Vérifier que tous les tags appartiennent à l'utilisateur
    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds }, userId },
    });
    if (tags.length !== tagIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Tags invalides' },
        },
        { status: 400 }
      );
    }

    // Remplacer les associations
    await prisma.$transaction([
      prisma.documentTag.deleteMany({ where: { documentId: id } }),
      ...tagIds.map((tagId) =>
        prisma.documentTag.create({ data: { documentId: id, tagId } })
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tags: tags.map((t) => ({ id: t.id, name: t.name, color: t.color })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
