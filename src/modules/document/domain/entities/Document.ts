import {
  AI_ANALYSIS_MIN_WORD_COUNT,
  AI_ANALYSIS_THRESHOLD_VERSIONS,
} from '@shared/constants';
import { ValidationError } from '@shared/errors';
import { DocumentContent } from '../value-objects/DocumentContent';
import { WritingStyle } from './WritingStyle';

/**
 * Entité Document représentant un document écrit par un utilisateur
 */
export class Document {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public content: DocumentContent,
    public style: WritingStyle,
    public version: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public sortOrder: number = 0,
    public bookId: string | null = null,
    public chapterOrder: number | null = null
  ) {}

  /**
   * Met à jour le contenu du document
   * Incrémente automatiquement la version
   * @param newContent - Nouveau contenu
   */
  updateContent(newContent: DocumentContent): void {
    this.content = newContent;
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * Vérifie si le document nécessite une analyse IA
   * Critères:
   * - Plus de 100 mots
   * - Version multiple de 5
   * @returns true si une analyse est recommandée
   */
  needsAIAnalysis(): boolean {
    return (
      this.content.wordCount > AI_ANALYSIS_MIN_WORD_COUNT &&
      this.version % AI_ANALYSIS_THRESHOLD_VERSIONS === 0
    );
  }

  /**
   * Valide que le document est prêt à être sauvegardé
   * @throws {Error} Si la validation échoue
   */
  validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new ValidationError('Le titre ne peut pas être vide');
    }

    if (this.content.wordCount === 0) {
      throw new ValidationError('Le document ne peut pas être vide');
    }
  }

  /**
   * Met à jour l'ordre d'affichage du document
   */
  updateSortOrder(order: number): void {
    this.sortOrder = order;
  }

  /**
   * Assigne le document à un livre (chapitre)
   */
  assignToBook(bookId: string | null, chapterOrder: number | null): void {
    this.bookId = bookId;
    this.chapterOrder = chapterOrder;
    this.updatedAt = new Date();
  }

  /**
   * Retire le document d'un livre
   */
  removeFromBook(): void {
    this.bookId = null;
    this.chapterOrder = null;
    this.updatedAt = new Date();
  }
}
