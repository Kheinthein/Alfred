import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateTagSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Nom trop long'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format #RRGGBB)')
    .optional(),
});

/**
 * GET /api/tags
 * Liste les tags de l'utilisateur connecté
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: { _count: { select: { documents: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        tags: tags.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          documentCount: t._count.documents,
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/tags
 * Crée un nouveau tag
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const body: unknown = await request.json();
    const data = CreateTagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: { name: data.name, color: data.color ?? null, userId },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          tag: {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            documentCount: 0,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
