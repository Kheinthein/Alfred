import { Document } from '@modules/document/domain/entities/Document';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
/* eslint-disable @typescript-eslint/unbound-method */

import { DeleteDocument } from '@modules/document/domain/use-cases/DeleteDocument';
import { DocumentContent } from '@modules/document/domain/value-objects/DocumentContent';
import { NotFoundError, UnauthorizedError } from '@shared/errors';

describe('DeleteDocument Use Case', () => {
  let deleteDocument: DeleteDocument;
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let mockStyle: WritingStyle;
  let existingDocument: Document;

  beforeEach(() => {
    mockDocumentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      countByUserId: jest.fn(),
      updateSortOrders: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      findByIdIncludeDeleted: jest.fn(),
      findDeletedByUserId: jest.fn(),
    };

    mockStyle = new WritingStyle('style-1', 'Roman', 'Style roman');
    existingDocument = new Document(
      'doc-123',
      'user-456',
      'Titre',
      new DocumentContent('Contenu'),
      mockStyle,
      1,
      new Date(),
      new Date()
    );

    deleteDocument = new DeleteDocument(mockDocumentRepository);
  });

  describe('Cas nominaux', () => {
    it('devrait supprimer un document avec succès', async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);
      mockDocumentRepository.delete.mockResolvedValue();

      await deleteDocument.execute({
        documentId: 'doc-123',
        userId: 'user-456',
      });

      expect(mockDocumentRepository.delete).toHaveBeenCalledWith('doc-123');
    });
  });

  describe('Erreurs', () => {
    it("devrait rejeter si le document n'existe pas", async () => {
      mockDocumentRepository.findById.mockResolvedValue(null);

      await expect(
        deleteDocument.execute({
          documentId: 'doc-999',
          userId: 'user-456',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("devrait rejeter si l'utilisateur n'est pas le propriétaire", async () => {
      mockDocumentRepository.findById.mockResolvedValue(existingDocument);

      await expect(
        deleteDocument.execute({
          documentId: 'doc-123',
          userId: 'user-999',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
