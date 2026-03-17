import { PrismaClient } from '@prisma/client';
import { Book } from '../../domain/entities/Book';
import { IBookRepository } from '../../domain/repositories/IBookRepository';

/**
 * Implémentation du repository Book avec Prisma
 */
export class BookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Book | null> {
    const data = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByUserId(userId: string): Promise<Book[]> {
    const data = await this.prisma.book.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async save(book: Book): Promise<void> {
    await this.prisma.book.upsert({
      where: { id: book.id },
      create: {
        id: book.id,
        userId: book.userId,
        title: book.title,
        description: book.description,
        sortOrder: BigInt(book.sortOrder),
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      },
      update: {
        title: book.title,
        description: book.description,
        sortOrder: BigInt(book.sortOrder),
        updatedAt: book.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.book.delete({
      where: { id },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.book.count({
      where: { userId },
    });
  }

  async updateSortOrders(
    userId: string,
    orders: Array<{ id: string; sortOrder: number }>
  ): Promise<void> {
    await this.prisma.$transaction(
      orders.map((order) =>
        this.prisma.book.update({
          where: { id: order.id, userId },
          data: { sortOrder: BigInt(order.sortOrder) },
        })
      )
    );
  }

  private toDomain(data: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    sortOrder: bigint | number;
    createdAt: Date;
    updatedAt: Date;
  }): Book {
    return new Book(
      data.id,
      data.userId,
      data.title,
      data.description,
      Number(data.sortOrder),
      data.createdAt,
      data.updatedAt
    );
  }
}
