export interface DocumentVersionDTO {
  id: string;
  documentId: string;
  version: number;
  title: string;
  content: string;
  wordCount: number;
  createdAt: Date;
}

/**
 * Interface (Port) pour le repository DocumentVersion
 */
export interface IDocumentVersionRepository {
  /**
   * Sauvegarde un snapshot de version
   */
  save(version: DocumentVersionDTO): Promise<void>;

  /**
   * Récupère toutes les versions d'un document (du plus récent au plus ancien)
   */
  findByDocumentId(documentId: string): Promise<DocumentVersionDTO[]>;

  /**
   * Récupère une version spécifique par numéro
   */
  findByVersion(
    documentId: string,
    version: number
  ): Promise<DocumentVersionDTO | null>;

  /**
   * Récupère la dernière version enregistrée d'un document
   */
  findLatest(documentId: string): Promise<DocumentVersionDTO | null>;
}
