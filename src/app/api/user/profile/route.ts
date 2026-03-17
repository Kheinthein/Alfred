import { authenticateRequest } from '@/app/api/middleware/auth';
import { handleError } from '@/app/api/middleware/errorHandler';
import { prisma } from '@shared/infrastructure/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email('Email invalide').optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre')
    .optional(),
});

/**
 * GET /api/user/profile
 * Récupère le profil de l'utilisateur connecté
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Utilisateur non trouvé' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { user } });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/user/profile
 * Met à jour le profil (nom, email, mot de passe)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const body: unknown = await request.json();
    const data = UpdateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Utilisateur non trouvé' },
        },
        { status: 404 }
      );
    }

    // Changement de mot de passe : vérifier l'ancien
    let passwordHash: string | undefined;
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Mot de passe actuel requis pour en définir un nouveau',
            },
          },
          { status: 400 }
        );
      }
      const valid = await bcrypt.compare(
        data.currentPassword,
        user.passwordHash
      );
      if (!valid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Mot de passe actuel incorrect',
            },
          },
          { status: 400 }
        );
      }
      passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    // Changement d'email : vérifier l'unicité
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'CONFLICT', message: 'Cet email est déjà utilisé' },
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(passwordHash && { passwordHash }),
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: { user: updated } });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/user/profile
 * Supprime le compte (RGPD — droit à l'oubli)
 * Supprime toutes les données de l'utilisateur en cascade
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = authenticateRequest(request);
    const body = (await request.json()) as { password: string };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Utilisateur non trouvé' },
        },
        { status: 404 }
      );
    }

    // Vérification du mot de passe avant suppression définitive
    const valid = await bcrypt.compare(body.password ?? '', user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Mot de passe incorrect' },
        },
        { status: 403 }
      );
    }

    // Suppression en cascade (Prisma + onDelete: Cascade dans le schéma)
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      data: { message: 'Compte supprimé définitivement' },
    });
  } catch (error) {
    return handleError(error);
  }
}
