import { NotFoundError, ValidationError } from '@shared/errors';
import { Book } from '../entities/Book';
import { IBookRepository } from '../repositories/IBookRepository';

export interface UpdateBookInput {
  id: string;
  userId: string;
  title?: string;
  description?: string | null;
}

export interface UpdateBookOutput {
  book: Book;
}

/**
 * Use Case : Mettre à jour un livre
 *
 * Responsabilités:
 * - Valider les données d'entrée
 * - Récupérer le livre existant
 * - Mettre à jour les champs modifiés
 * - Sauvegarder via le repository
 */
export class UpdateBook {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(input: UpdateBookInput): Promise<UpdateBookOutput> {
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
        "Vous n'avez pas la permission de modifier ce livre"
      );
    }

    // 4. Mettre à jour les champs modifiés
    if (input.title !== undefined) {
      book.updateTitle(input.title);
    }

    if (input.description !== undefined) {
      book.updateDescription(input.description);
    }

    // 5. Valider le livre
    book.validate();

    // 6. Sauvegarder
    await this.bookRepository.save(book);

    return { book };
  }
}
