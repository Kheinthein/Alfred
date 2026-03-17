import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
/* eslint-disable @typescript-eslint/unbound-method */

import { CreateDocument } from '@modules/document/domain/use-cases/CreateDocument';
import { ValidationError } from '@shared/errors';

describe('CreateDocument Use Case', () => {
  let createDocument: CreateDocument;
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;

  const mockStyle = new WritingStyle('style-1', 'Roman', 'Style roman');

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

    createDocument = new CreateDocument(mockDocumentRepository);
  });

  describe('Cas nominaux', () => {
    it('devrait créer un document avec succès', async () => {
      mockDocumentRepository.save.mockResolvedValue();

      const result = await createDocument.execute({
        userId: 'user-123',
        title: 'Mon Premier Roman',
        content: 'Il était une fois...',
        style: mockStyle,
      });

      expect(result.document.userId).toBe('user-123');
      expect(result.document.title).toBe('Mon Premier Roman');
      expect(result.document.content.text).toBe('Il était une fois...');
      expect(result.document.style).toBe(mockStyle);
      expect(result.document.version).toBe(1);
      expect(mockDocumentRepository.save).toHaveBeenCalled();
    });

    it('devrait créer un document avec version initiale 1', async () => {
      mockDocumentRepository.save.mockResolvedValue();

      const result = await createDocument.execute({
        userId: 'user-123',
        title: 'Titre',
        content: 'Contenu',
        style: mockStyle,
      });

      expect(result.document.version).toBe(1);
    });

    it('devrait définir createdAt et updatedAt', async () => {
      mockDocumentRepository.save.mockResolvedValue();
      const before = new Date();

      const result = await createDocument.execute({
        userId: 'user-123',
        title: 'Titre',
        content: 'Contenu',
        style: mockStyle,
      });

      const after = new Date();

      expect(result.document.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(result.document.createdAt.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
      expect(result.document.updatedAt).toEqual(result.document.createdAt);
    });
  });

  describe('Validation', () => {
    it('devrait rejeter un titre vide', async () => {
      await expect(
        createDocument.execute({
          userId: 'user-123',
          title: '',
          content: 'Contenu',
          style: mockStyle,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('devrait rejeter un contenu vide', async () => {
      await expect(
        createDocument.execute({
          userId: 'user-123',
          title: 'Titre',
          content: '',
          style: mockStyle,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('devrait rejeter si userId est vide', async () => {
      await expect(
        createDocument.execute({
          userId: '',
          title: 'Titre',
          content: 'Contenu',
          style: mockStyle,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('devrait rejeter si style est null', async () => {
      await expect(
        createDocument.execute({
          userId: 'user-123',
          title: 'Titre',
          content: 'Contenu',
          style: null as unknown as WritingStyle,
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Edge cases', () => {
    it('devrait accepter un titre très long', async () => {
      mockDocumentRepository.save.mockResolvedValue();
      const longTitle = 'A'.repeat(200);

      const result = await createDocument.execute({
        userId: 'user-123',
        title: longTitle,
        content: 'Contenu',
        style: mockStyle,
      });

      expect(result.document.title).toBe(longTitle);
    });

    it('devrait accepter un contenu très long', async () => {
      mockDocumentRepository.save.mockResolvedValue();
      const longContent = 'mot '.repeat(10000);

      const result = await createDocument.execute({
        userId: 'user-123',
        title: 'Titre',
        content: longContent,
        style: mockStyle,
      });

      expect(result.document.content.wordCount).toBe(10000);
    });
  });
});
