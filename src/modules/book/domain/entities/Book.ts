import { ValidationError } from '@shared/errors';

/**
 * Entité Book représentant un livre contenant plusieurs documents (chapitres)
 */
export class Book {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public description: string | null,
    public sortOrder: number,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Met à jour le titre du livre
   */
  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new ValidationError('Le titre ne peut pas être vide');
    }
    this.title = newTitle;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour la description du livre
   */
  updateDescription(newDescription: string | null): void {
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour l'ordre d'affichage du livre
   */
  updateSortOrder(order: number): void {
    this.sortOrder = order;
    this.updatedAt = new Date();
  }

  /**
   * Valide que le livre est prêt à être sauvegardé
   * @throws {ValidationError} Si la validation échoue
   */
  validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new ValidationError('Le titre ne peut pas être vide');
    }

    if (!this.userId || this.userId.trim().length === 0) {
      throw new ValidationError("L'ID utilisateur est requis");
    }
  }
}
