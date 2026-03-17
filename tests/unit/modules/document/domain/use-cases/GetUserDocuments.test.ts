/* eslint-disable @typescript-eslint/unbound-method */

import { Document } from '@modules/document/domain/entities/Document';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { GetUserDocuments } from '@modules/document/domain/use-cases/GetUserDocuments';
import { DocumentContent } from '@modules/document/domain/value-objects/DocumentContent';

describe('GetUserDocuments Use Case', () => {
  let getUserDocuments: GetUserDocuments;
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let mockStyle: WritingStyle;

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

    mockStyle = new WritingStyle('style-1', 'Roman', 'Style roman');
    getUserDocuments = new GetUserDocuments(mockDocumentRepository);
  });

  describe('Cas nominaux', () => {
    it("devrait retourner tous les documents d'un utilisateur", async () => {
      const docs = [
        new Document(
          'doc-1',
          'user-123',
          'Document 1',
          new DocumentContent('Contenu 1'),
          mockStyle,
          1,
          new Date(),
          new Date(),
          1
        ),
        new Document(
          'doc-2',
          'user-123',
          'Document 2',
          new DocumentContent('Contenu 2'),
          mockStyle,
          1,
          new Date(),
          new Date(),
          0
        ),
      ];

      mockDocumentRepository.findByUserId.mockResolvedValue(docs);

      const result = await getUserDocuments.execute({ userId: 'user-123' });

      expect(result.documents).toHaveLength(2);
      // Le tri est désormais délégué au repository (DB), l'ordre reflète celui retourné par le mock
      expect(result.documents[0].title).toBe('Document 1');
      expect(result.documents[1].title).toBe('Document 2');
      expect(mockDocumentRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ search: undefined, tagId: undefined })
      );
    });

    it('devrait retourner un tableau vide si aucun document', async () => {
      mockDocumentRepository.findByUserId.mockResolvedValue([]);

      const result = await getUserDocuments.execute({ userId: 'user-123' });

      expect(result.documents).toHaveLength(0);
    });

    it("devrait retourner uniquement les documents de l'utilisateur", async () => {
      const userDocs = [
        new Document(
          'doc-1',
          'user-123',
          'Mon Document',
          new DocumentContent('Contenu'),
          mockStyle,
          1,
          new Date(),
          new Date()
        ),
      ];

      mockDocumentRepository.findByUserId.mockResolvedValue(userDocs);

      const result = await getUserDocuments.execute({ userId: 'user-123' });

      expect(result.documents).toHaveLength(1);
      result.documents.forEach((doc) => {
        expect(doc.userId).toBe('user-123');
      });
    });

    it('devrait passer les options de tri et filtre au repository', async () => {
      mockDocumentRepository.findByUserId.mockResolvedValue([]);

      await getUserDocuments.execute({
        userId: 'user-123',
        search: 'roman',
        tagId: 'tag-1',
        styleId: 'style-1',
        sortField: 'title',
        sortOrder: 'asc',
      });

      expect(mockDocumentRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          search: 'roman',
          tagId: 'tag-1',
          styleId: 'style-1',
          sortField: 'title',
          sortOrder: 'asc',
        })
      );
    });
  });
});
