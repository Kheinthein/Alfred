import { NotFoundError, ValidationError } from '@shared/errors';
import { IBookRepository } from '../repositories/IBookRepository';

export interface DeleteBookInput {
  id: string;
  userId: string;
}

export interface DeleteBookOutput {
  success: boolean;
}

/**
 * Use Case : Supprimer un livre
 *
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que le livre existe et appartient à l'utilisateur
 * - Supprimer via le repository
 */
export class DeleteBook {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(input: DeleteBookInput): Promise<DeleteBookOutput> {
    // 1. Valider les entrées
    if (!input.id || input.id.trim().length === 0) {
      throw new ValidationError("L'ID du livre est requis");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationError("L'ID utilisateur est requis");
    }

    // 2. Récupérer le livre existant
    const book = await this.bookRepository.findById(input.id);

    if (!book) {
      throw new NotFoundError('Livre non trouvé');
    }

    // 3. Vérifier que l'utilisateur est propriétaire
    if (book.userId !== input.userId) {
      throw new ValidationError(
        "Vous n'avez pas la permission de supprimer ce livre"
      );
    }

    // 4. Supprimer
    await this.bookRepository.delete(input.id);

    return { success: true };
  }
}
