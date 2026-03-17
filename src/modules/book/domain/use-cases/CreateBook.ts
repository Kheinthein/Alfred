import { ValidationError } from '@shared/errors';
import { Book } from '../entities/Book';
import { IBookRepository } from '../repositories/IBookRepository';

export interface CreateBookInput {
  userId: string;
  title: string;
  description?: string | null;
}

export interface CreateBookOutput {
  book: Book;
}

/**
 * Use Case : Créer un nouveau livre
 *
 * Responsabilités:
 * - Valider les données d'entrée
 * - Créer l'entité Book
 * - Sauvegarder via le repository
 */
export class CreateBook {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(input: CreateBookInput): Promise<CreateBookOutput> {
    // 1. Valider les entrées
    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationError("L'ID utilisateur est requis");
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError('Le titre est requis');
    }

    // 2. Créer le livre
    const now = new Date();
    const sortOrder = Date.now();
    const book = new Book(
      this.generateId(),
      input.userId,
      input.title,
      input.description || null,
      sortOrder,
      now,
      now
    );

    // 3. Valider le livre
    book.validate();

    // 4. Sauvegarder
    await this.bookRepository.save(book);

    return { book };
  }

  private generateId(): string {
    return `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
