import { NotFoundError, ValidationError } from '@shared/errors';
import { IDocumentRepository } from '../repositories/IDocumentRepository';
import { IBookRepository } from '@modules/book/domain/repositories/IBookRepository';

export interface MoveDocumentToBookInput {
  documentId: string;
  userId: string;
  bookId: string | null;
  chapterOrder?: number | null;
}

export interface MoveDocumentToBookOutput {
  success: boolean;
}

/**
 * Use Case : Déplacer un document dans un livre (ou le retirer)
 *
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que le document et le livre existent
 * - Vérifier les permissions
 * - Mettre à jour le document
 */
export class MoveDocumentToBook {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async execute(
    input: MoveDocumentToBookInput
  ): Promise<MoveDocumentToBookOutput> {
    // 1. Valider les entrées
    if (!input.documentId || input.documentId.trim().length === 0) {
      throw new ValidationError("L'ID du document est requis");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationError("L'ID utilisateur est requis");
    }

    // 2. Récupérer le document
    const document = await this.documentRepository.findById(input.documentId);

    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // 3. Vérifier que l'utilisateur est propriétaire
    if (document.userId !== input.userId) {
      throw new ValidationError(
        "Vous n'avez pas la permission de modifier ce document"
      );
    }

    // 4. Si bookId est fourni, vérifier que le livre existe et appartient à l'utilisateur
    if (input.bookId) {
      const book = await this.bookRepository.findById(input.bookId);

      if (!book) {
        throw new NotFoundError('Livre non trouvé');
      }

      if (book.userId !== input.userId) {
        throw new ValidationError(
          "Vous n'avez pas la permission d'utiliser ce livre"
        );
      }
    }

    // 5. Mettre à jour le document
    document.assignToBook(input.bookId, input.chapterOrder ?? null);

    // 6. Sauvegarder
    await this.documentRepository.save(document);

    return { success: true };
  }
}
