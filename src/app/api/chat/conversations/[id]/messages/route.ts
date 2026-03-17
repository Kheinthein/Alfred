import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { container } from '@/container';
import { IAIServicePort } from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

/**
 * GET /api/chat/conversations/[id]/messages
 * Récupère l'historique d'une conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id: conversationId } = await params;

    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Conversation non trouvée' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/chat/conversations/[id]/messages
 * Envoie un message et obtient la réponse de l'IA
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const { id: conversationId } = await params;
    const body: unknown = await request.json();
    const { content } = SendMessageSchema.parse(body);

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        document: { select: { content: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Conversation non trouvée' },
        },
        { status: 404 }
      );
    }

    // Persister le message de l'utilisateur
    const userMessage = await prisma.chatMessage.create({
      data: { conversationId, role: 'user', content },
    });

    // Préparer l'historique pour l'IA
    const history = conversation.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    history.push({ role: 'user', content });

    // Appeler l'IA
    const aiService = container.get<IAIServicePort>('IAIServicePort');
    const aiReply = await aiService.chat(
      history,
      conversation.document.content
    );

    // Persister la réponse de l'IA
    const assistantMessage = await prisma.chatMessage.create({
      data: { conversationId, role: 'assistant', content: aiReply },
    });

    return NextResponse.json({
      success: true,
      data: {
        userMessage: {
          id: userMessage.id,
          role: 'user',
          content,
          createdAt: userMessage.createdAt,
        },
        assistantMessage: {
          id: assistantMessage.id,
          role: 'assistant',
          content: aiReply,
          createdAt: assistantMessage.createdAt,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
