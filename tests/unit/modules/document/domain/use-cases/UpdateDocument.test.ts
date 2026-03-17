/* eslint-disable @typescript-eslint/unbound-method */

import { Document } from '@modules/document/domain/entities/Document';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { IDocumentVersionRepository } from '@modules/document/domain/repositories/IDocumentVersionRepository';
import { UpdateDocument } from '@modules/document/domain/use-cases/UpdateDocument';
import { DocumentContent } from '@modules/document/domain/value-objects/DocumentContent';
import { NotFoundError, UnauthorizedError } from '@shared/errors';

describe('UpdateDocument Use Case', () => {
  let updateDocument: UpdateDocument;
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let mockVersionRepository: jest.Mocked<IDocumentVersionRepository>;
  let mockStyle: WritingStyle;
  let existingDocument: Document;

  beforeEach(() => {
    mockDocumentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findDeletedByUserId: jest.fn(),
      findByIdIncludeDeleted: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      delete: jest.fn(),
      countByUserId: jest.fn(),
      updateSortOrders: jest.fn(),
    };

    mockVersionRepository = {
      save: jest.fn(),
      findByDocumentId: jest.fn(),
      findByVersion: jest.fn(),
      findLatest: jest.fn().mockResolvedValue(null), // pas de version précédente par défaut
    };

    mockStyle = new WritingStyle('style-1', 'Roman', 'Style roman');
    existingDocument = new Document(
      'doc-123',
      'user-456',
      'Titre Original',
      new DocumentContent('Contenu original'),
      mockStyle,
      1,
      new Date('2024-01-01'),
      new Date('2024-01-01')
    );

    updateDocument = new UpdateDocument(
      mockDocumentRepository,
      mockVersionRepository
    );
  });

  describe('Cas nominaux', () => {
    it('devrait mettre à jour le contenu et incrémenter la version', async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);
      mockDocumentRepository.save.mockResolvedValue();

      const result = await updateDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        content: 'Nouveau contenu',
      });

      expect(result.document.content.text).toBe('Nouveau contenu');
      expect(result.document.version).toBe(2);
      expect(mockDocumentRepository.save).toHaveBeenCalledWith(
        existingDocument
      );
    });

    it('devrait mettre à jour uniquement le titre sans incrémenter la version', async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);
      mockDocumentRepository.save.mockResolvedValue();

      const result = await updateDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        title: 'Nouveau Titre',
      });

      expect(result.document.title).toBe('Nouveau Titre');
      expect(result.document.content.text).toBe('Contenu original');
      expect(result.document.version).toBe(1);
    });

    it('devrait mettre à jour titre et contenu', async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);
      mockDocumentRepository.save.mockResolvedValue();

      const result = await updateDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        title: 'Nouveau Titre',
        content: 'Nouveau contenu',
      });

      expect(result.document.title).toBe('Nouveau Titre');
      expect(result.document.content.text).toBe('Nouveau contenu');
      expect(result.document.version).toBe(2);
    });

    it("devrait mettre à jour updatedAt lors d'une modification de contenu", async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);
      mockDocumentRepository.save.mockResolvedValue();
      const before = new Date();

      const result = await updateDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        content: 'Nouveau contenu',
      });

      expect(result.document.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
    });

    it('ne devrait pas créer de snapshot si wordDiff < 150 et < 30 min écoulées', async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);
      mockDocumentRepository.save.mockResolvedValue();
      // findLatest retourne une version récente (il y a 5 min)
      mockVersionRepository.findLatest.mockResolvedValue({
        id: 'ver-1',
        documentId: 'doc-123',
        version: 1,
        title: 'Titre',
        content: 'Contenu original',
        wordCount: 2,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      });

      await updateDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        content: 'Contenu légèrement modifié',
      });

      expect(mockVersionRepository.save).not.toHaveBeenCalled();
    });

    it('devrait créer un snapshot si wordDiff >= 150', async () => {
      const longContent = 'mot '.repeat(200); // 200 mots
      const docWithShortContent = new Document(
        'doc-123',
        'user-456',
        'Titre',
        new DocumentContent('peu de mots'),
        mockStyle,
        1,
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      mockDocumentRepository.findById.mockResolvedValue(docWithShortContent);
      mockDocumentRepository.save.mockResolvedValue();
      mockVersionRepository.save.mockResolvedValue();

      await updateDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        content: longContent,
      });

      expect(mockVersionRepository.save).toHaveBeenCalledTimes(1);
    });

    it('devrait créer un snapshot si >= 1 mot de diff et >= 30 min écoulées', async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);
      mockDocumentRepository.save.mockResolvedValue();
      mockVersionRepository.findLatest.mockResolvedValue({
        id: 'ver-1',
        documentId: 'doc-123',
        version: 1,
        title: 'Titre',
        content: 'Contenu original',
        wordCount: 2,
        createdAt: new Date(Date.now() - 31 * 60 * 1000), // 31 min ago
      });
      mockVersionRepository.save.mockResolvedValue();

      await updateDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
        content: 'Contenu modifié avec un mot supplémentaire',
      });

      expect(mockVersionRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('Erreurs', () => {
    it("devrait rejeter si le document n'existe pas", async () => {
      mockDocumentRepository.findById.mockResolvedValue(null);

      await expect(
        updateDocument.execute({
          documentId: 'doc-999',
          userId: 'user-456',
          content: 'Contenu',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("devrait rejeter si l'utilisateur n'est pas le propriétaire", async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);

      await expect(
        updateDocument.execute({
          documentId: 'doc-123',
          userId: 'user-999',
          content: 'Contenu',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('devrait rejeter si aucune mise à jour fournie', async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);

      await expect(
        updateDocument.execute({
          documentId: 'doc-123',
          userId: 'user-456',
        })
      ).rejects.toThrow('Aucune mise à jour fournie');
    });
  });
});
