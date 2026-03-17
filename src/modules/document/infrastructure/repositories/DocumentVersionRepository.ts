import {
  DocumentVersionDTO,
  IDocumentVersionRepository,
} from '@modules/document/domain/repositories/IDocumentVersionRepository';
import { PrismaClient } from '@prisma/client';

export class DocumentVersionRepository implements IDocumentVersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(version: DocumentVersionDTO): Promise<void> {
    await this.prisma.documentVersion.upsert({
      where: {
        documentId_version: {
          documentId: version.documentId,
          version: version.version,
        },
      },
      update: {},
      create: {
        id: version.id,
        documentId: version.documentId,
        version: version.version,
        title: version.title,
        content: version.content,
        wordCount: version.wordCount,
        createdAt: version.createdAt,
      },
    });
  }

  async findByDocumentId(documentId: string): Promise<DocumentVersionDTO[]> {
    const versions = await this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
    });

    return versions.map((v) => ({
      id: v.id,
      documentId: v.documentId,
      version: v.version,
      title: v.title,
      content: v.content,
      wordCount: v.wordCount,
      createdAt: v.createdAt,
    }));
  }

  async findByVersion(
    documentId: string,
    version: number
  ): Promise<DocumentVersionDTO | null> {
    const v = await this.prisma.documentVersion.findUnique({
      where: { documentId_version: { documentId, version } },
    });
    if (!v) return null;
    return {
      id: v.id,
      documentId: v.documentId,
      version: v.version,
      title: v.title,
      content: v.content,
      wordCount: v.wordCount,
      createdAt: v.createdAt,
    };
  }

  async findLatest(documentId: string): Promise<DocumentVersionDTO | null> {
    const v = await this.prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });
    if (!v) return null;
    return {
      id: v.id,
      documentId: v.documentId,
      version: v.version,
      title: v.title,
      content: v.content,
      wordCount: v.wordCount,
      createdAt: v.createdAt,
    };
  }
}
