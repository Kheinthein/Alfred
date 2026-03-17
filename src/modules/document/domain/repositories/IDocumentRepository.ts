import { Document } from '../entities/Document';

export type DocumentSortField =
  | 'updatedAt'
  | 'createdAt'
  | 'title'
  | 'wordCount';
export type DocumentSortOrder = 'asc' | 'desc';

export interface DocumentQueryOptions {
  search?: string;
  tagId?: string;
  styleId?: string;
  sortField?: DocumentSortField;
  sortOrder?: DocumentSortOrder;
}

/**
 * Interface (Port) pour le repository Document
 */
export interface IDocumentRepository {
  /**
   * Trouve un document par son ID
   */
  findById(id: string): Promise<Document | null>;

  /**
   * Trouve tous les documents d'un utilisateur, avec filtres et tri optionnels
   */
  findByUserId(
    userId: string,
    options?: DocumentQueryOptions
  ): Promise<Document[]>;

  /**
   * Sauvegarde un document (création ou mise à jour)
   */
  save(document: Document): Promise<void>;

  /**
   * Suppression logique (soft delete) — met deletedAt à now()
   */
  softDelete(id: string): Promise<void>;

  /**
   * Restaure un document supprimé logiquement
   */
  restore(id: string): Promise<void>;

  /**
   * Suppression physique définitive
   */
  delete(id: string): Promise<void>;

  /**
   * Trouve un document par ID, même s'il est en corbeille
   */
  findByIdIncludeDeleted(id: string): Promise<Document | null>;

  /**
   * Trouve les documents supprimés logiquement d'un utilisateur (corbeille)
   */
  findDeletedByUserId(userId: string): Promise<Document[]>;

  /**
   * Compte le nombre de documents d'un utilisateur
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Met à jour l'ordre d'affichage des documents d'un utilisateur
   */
  updateSortOrders(
    userId: string,
    orders: Array<{ id: string; sortOrder: number }>
  ): Promise<void>;
}
