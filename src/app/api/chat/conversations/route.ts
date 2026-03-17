import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateConversationSchema = z.object({
  documentId: z.string().min(1),
});

/**
 * POST /api/chat/conversations
 * Crée ou récupère la conversation liée à un document
 * (une seule conversation par document par utilisateur)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const body: unknown = await request.json();
    const { documentId } = CreateConversationSchema.parse(body);

    // Vérifier que le document appartient à l'utilisateur
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Document non trouvé' },
        },
        { status: 404 }
      );
    }

    // Récupérer la conversation existante ou en créer une
    const existing = await prisma.chatConversation.findFirst({
      where: { documentId, userId },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          conversation: {
            id: existing.id,
            documentId,
            createdAt: existing.createdAt,
          },
        },
      });
    }

    const conversation = await prisma.chatConversation.create({
      data: { documentId, userId },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            documentId,
            createdAt: conversation.createdAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
