import { Document } from '@modules/document/domain/entities/Document';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';
import {
  DocumentQueryOptions,
  IDocumentRepository,
} from '@modules/document/domain/repositories/IDocumentRepository';
import { DocumentContent } from '@modules/document/domain/value-objects/DocumentContent';
import { PrismaClient } from '@prisma/client';

/**
 * Implémentation du repository Document avec Prisma
 */
export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Document | null> {
    const doc = await this.prisma.document.findUnique({
      where: { id, deletedAt: null },
      include: { style: true },
    });

    if (!doc) return null;

    return this.toDomain(doc);
  }

  async findByUserId(
    userId: string,
    options: DocumentQueryOptions = {}
  ): Promise<Document[]> {
    const {
      search,
      tagId,
      styleId,
      sortField = 'updatedAt',
      sortOrder = 'desc',
    } = options;

    // Construire l'orderBy dynamique
    type PrismaOrderBy = Record<string, 'asc' | 'desc'>;
    const sortableFields: Record<string, PrismaOrderBy> = {
      updatedAt: { updatedAt: sortOrder },
      createdAt: { createdAt: sortOrder },
      title: { title: sortOrder },
      wordCount: { wordCount: sortOrder },
    };
    const primaryOrder = sortableFields[sortField] ?? { updatedAt: 'desc' };
    // Pour les tris autres que sortOrder manuel, on ignore le sortOrder de drag&drop
    const orderBy: PrismaOrderBy[] =
      sortField === 'updatedAt' || sortField === 'createdAt'
        ? [{ sortOrder: 'asc' } as PrismaOrderBy, primaryOrder]
        : [primaryOrder];

    const docs = await this.prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(search ? { title: { contains: search } } : {}),
        ...(tagId ? { tags: { some: { tagId } } } : {}),
        ...(styleId ? { styleId } : {}),
      },
      include: { style: true },
      orderBy,
    });

    return docs.map((doc) => this.toDomain(doc));
  }

  async findByIdIncludeDeleted(id: string): Promise<Document | null> {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { style: true },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findDeletedByUserId(userId: string): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: { userId, deletedAt: { not: null } },
      include: { style: true },
      orderBy: { deletedAt: 'desc' },
    });
    return docs.map((doc) => this.toDomain(doc));
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async save(document: Document): Promise<void> {
    await this.prisma.document.upsert({
      where: { id: document.id },
      update: {
        title: document.title,
        content: document.content.text,
        wordCount: document.content.wordCount,
        version: document.version,
        sortOrder: BigInt(document.sortOrder),
        bookId: document.bookId,
        chapterOrder: document.chapterOrder ?? null,
        updatedAt: document.updatedAt,
      },
      create: {
        id: document.id,
        userId: document.userId,
        title: document.title,
        content: document.content.text,
        wordCount: document.content.wordCount,
        styleId: document.style.id,
        version: document.version,
        sortOrder: BigInt(document.sortOrder),
        bookId: document.bookId,
        chapterOrder: document.chapterOrder ?? null,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({
      where: { id },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.document.count({
      where: { userId },
    });
  }

  async updateSortOrders(
    userId: string,
    orders: Array<{ id: string; sortOrder: number }>
  ): Promise<void> {
    await this.prisma.$transaction(
      orders.map(({ id, sortOrder }) =>
        this.prisma.document.updateMany({
          where: { id, userId },
          data: { sortOrder: BigInt(sortOrder) },
        })
      )
    );
  }

  /**
   * Convertit un model Prisma en entité Domain
   */
  private toDomain(data: {
    id: string;
    userId: string;
    title: string;
    content: string;
    wordCount: number;
    version: number;
    sortOrder: bigint;
    bookId: string | null;
    chapterOrder: number | null;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    style: {
      id: string;
      name: string;
      description: string;
    };
  }): Document {
    const content = new DocumentContent(data.content);
    const style = new WritingStyle(
      data.style.id,
      data.style.name,
      data.style.description
    );

    return new Document(
      data.id,
      data.userId,
      data.title,
      content,
      style,
      data.version,
      data.createdAt,
      data.updatedAt,
      Number(data.sortOrder),
      data.bookId,
      data.chapterOrder ?? null
    );
  }
}
