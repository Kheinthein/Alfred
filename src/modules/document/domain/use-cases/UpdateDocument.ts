import { Document } from '../entities/Document';
import { DocumentContent } from '../value-objects/DocumentContent';
import { IDocumentRepository } from '../repositories/IDocumentRepository';
import { IDocumentVersionRepository } from '../repositories/IDocumentVersionRepository';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@shared/errors';

export interface UpdateDocumentInput {
  documentId: string;
  userId: string;
  title?: string;
  content?: string;
}

export interface UpdateDocumentOutput {
  document: Document;
}

export class UpdateDocument {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly versionRepository: IDocumentVersionRepository
  ) {}

  async execute(input: UpdateDocumentInput): Promise<UpdateDocumentOutput> {
    // 1. Récupérer le document
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Document non trouvé');
    }

    // 2. Vérifier les permissions
    if (document.userId !== input.userId) {
      throw new UnauthorizedError(
        "Vous n'avez pas la permission de modifier ce document"
      );
    }

    // 3. Vérifier qu'il y a au moins une mise à jour
    if (!input.title && !input.content) {
      throw new ValidationError('Aucune mise à jour fournie');
    }

    // 4. Décider si on crée un snapshot de version
    // Un snapshot est créé si : ≥ 150 mots de différence OU (≥ 1 mot ET 30 min écoulées depuis la dernière version)
    const WORD_DIFF_THRESHOLD = 150;
    const TIME_THRESHOLD_MS = 30 * 60 * 1000;

    const contentChanging =
      input.content !== undefined && input.content !== document.content.text;
    if (contentChanging) {
      const newWordCount = new DocumentContent(input.content!).wordCount;
      const wordDiff = Math.abs(newWordCount - document.content.wordCount);

      const byWordCount = wordDiff >= WORD_DIFF_THRESHOLD;
      let byTime = false;
      if (!byWordCount && wordDiff >= 1) {
        const lastVersion = await this.versionRepository.findLatest(
          document.id
        );
        const lastVersionTime = lastVersion?.createdAt ?? document.createdAt;
        byTime = Date.now() - lastVersionTime.getTime() >= TIME_THRESHOLD_MS;
      }

      if (byWordCount || byTime) {
        await this.versionRepository.save({
          id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          documentId: document.id,
          version: document.version,
          title: document.title,
          content: document.content.text,
          wordCount: document.content.wordCount,
          createdAt: document.updatedAt,
        });
      }
    }

    // 5. Mettre à jour le titre si fourni
    if (input.title !== undefined) {
      document.title = input.title;
      document.updatedAt = new Date();
    }

    // 6. Mettre à jour le contenu si fourni (incrémente version)
    if (input.content !== undefined) {
      const newContent = new DocumentContent(input.content);
      document.updateContent(newContent);
    }

    // 7. Valider le document
    document.validate();

    // 8. Sauvegarder
    await this.documentRepository.save(document);

    return { document };
  }
}
