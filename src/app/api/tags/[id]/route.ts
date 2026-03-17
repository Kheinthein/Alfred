import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UpdateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
});

/**
 * DELETE /api/tags/[id]
 * Supprime un tag
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag || tag.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Tag non trouvé' },
        },
        { status: 404 }
      );
    }

    await prisma.tag.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Tag supprimé' },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/tags/[id]
 * Renomme ou recolorie un tag
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id } = await params;
    const body: unknown = await request.json();
    const data = UpdateTagSchema.parse(body);

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag || tag.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Tag non trouvé' },
        },
        { status: 404 }
      );
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        tag: { id: updated.id, name: updated.name, color: updated.color },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
