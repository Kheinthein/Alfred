/* eslint-disable @typescript-eslint/unbound-method */

import { Document } from '@modules/document/domain/entities/Document';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { ReorderDocuments } from '@modules/document/domain/use-cases/ReorderDocuments';
import { DocumentContent } from '@modules/document/domain/value-objects/DocumentContent';
import { ValidationError } from '@shared/errors';

describe('ReorderDocuments Use Case', () => {
  let reorderDocuments: ReorderDocuments;
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let style: WritingStyle;
  let docs: Document[];

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

    style = new WritingStyle('style-1', 'Roman', 'Style roman');
    docs = [
      new Document(
        'doc-1',
        'user-1',
        'Doc 1',
        new DocumentContent('Texte 1'),
        style,
        1,
        new Date(),
        new Date(),
        0
      ),
      new Document(
        'doc-2',
        'user-1',
        'Doc 2',
        new DocumentContent('Texte 2'),
        style,
        1,
        new Date(),
        new Date(),
        1
      ),
    ];

    mockDocumentRepository.findByUserId.mockResolvedValue(docs);
    reorderDocuments = new ReorderDocuments(mockDocumentRepository);
  });

  it('devrait mettre à jour les ordres des documents', async () => {
    await reorderDocuments.execute({
      userId: 'user-1',
      documentIds: ['doc-2', 'doc-1'],
    });

    expect(mockDocumentRepository.updateSortOrders).toHaveBeenCalledWith(
      'user-1',
      [
        { id: 'doc-2', sortOrder: 0 },
        { id: 'doc-1', sortOrder: 1 },
      ]
    );
  });

  it('devrait rejeter si la liste contient des doublons', async () => {
    await expect(
      reorderDocuments.execute({
        userId: 'user-1',
        documentIds: ['doc-1', 'doc-1'],
      })
    ).rejects.toThrow(ValidationError);
    expect(mockDocumentRepository.updateSortOrders).not.toHaveBeenCalled();
  });

  it('devrait rejeter si un document manque', async () => {
    await expect(
      reorderDocuments.execute({
        userId: 'user-1',
        documentIds: ['doc-1'],
      })
    ).rejects.toThrow(ValidationError);
    expect(mockDocumentRepository.updateSortOrders).not.toHaveBeenCalled();
  });

  it('devrait rejeter si un document est inconnu', async () => {
    await expect(
      reorderDocuments.execute({
        userId: 'user-1',
        documentIds: ['doc-1', 'doc-3'],
      })
    ).rejects.toThrow(ValidationError);
    expect(mockDocumentRepository.updateSortOrders).not.toHaveBeenCalled();
  });
});
