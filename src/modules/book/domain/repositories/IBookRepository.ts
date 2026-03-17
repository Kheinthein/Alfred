import { Book } from '../entities/Book';

/**
 * Interface (Port) pour le repository Book
 */
export interface IBookRepository {
  /**
   * Trouve un livre par son ID
   */
  findById(id: string): Promise<Book | null>;

  /**
   * Trouve tous les livres d'un utilisateur
   */
  findByUserId(userId: string): Promise<Book[]>;

  /**
   * Sauvegarde un livre (création ou mise à jour)
   */
  save(book: Book): Promise<void>;

  /**
   * Supprime un livre
   */
  delete(id: string): Promise<void>;

  /**
   * Compte le nombre de livres d'un utilisateur
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Met à jour l'ordre d'affichage des livres d'un utilisateur
   */
  updateSortOrders(
    userId: string,
    orders: Array<{ id: string; sortOrder: number }>
  ): Promise<void>;
}
