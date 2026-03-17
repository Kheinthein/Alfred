import { ValidationError } from '@shared/errors';
import { IBookRepository } from '../repositories/IBookRepository';

export interface ReorderBooksInput {
  userId: string;
  bookIds: string[];
}

export interface ReorderBooksOutput {
  success: boolean;
}

/**
 * Use Case : Réorganiser l'ordre des livres
 *
 * Responsabilités:
 * - Valider les données d'entrée
 * - Mettre à jour l'ordre via le repository
 */
export class ReorderBooks {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(input: ReorderBooksInput): Promise<ReorderBooksOutput> {
    // 1. Valider les entrées
    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationError("L'ID utilisateur est requis");
    }

    if (!input.bookIds || input.bookIds.length === 0) {
      throw new ValidationError('La liste des IDs de livres est requise');
    }

    // 2. Créer les ordres
    const orders = input.bookIds.map((id, index) => ({
      id,
      sortOrder: Date.now() + index,
    }));

    // 3. Mettre à jour les ordres
    await this.bookRepository.updateSortOrders(input.userId, orders);

    return { success: true };
  }
}
