import { Document } from '../entities/Document';
import {
  DocumentQueryOptions,
  DocumentSortField,
  DocumentSortOrder,
  IDocumentRepository,
} from '../repositories/IDocumentRepository';

export interface GetUserDocumentsInput {
  userId: string;
  search?: string;
  tagId?: string;
  styleId?: string;
  sortField?: DocumentSortField;
  sortOrder?: DocumentSortOrder;
}

export interface GetUserDocumentsOutput {
  documents: Document[];
}

export class GetUserDocuments {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(input: GetUserDocumentsInput): Promise<GetUserDocumentsOutput> {
    const options: DocumentQueryOptions = {
      search: input.search,
      tagId: input.tagId,
      styleId: input.styleId,
      sortField: input.sortField,
      sortOrder: input.sortOrder,
    };

    const documents = await this.documentRepository.findByUserId(
      input.userId,
      options
    );
    return { documents };
  }
}
