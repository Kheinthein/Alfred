import { DocumentDTO } from '@shared/types';
import { apiClient } from './apiClient';

interface CreateDocumentPayload {
  title: string;
  content: string;
  styleId: string;
}

interface UpdateDocumentPayload {
  title?: string;
  content?: string;
}

export const documentService = {
  async list(options?: {
    search?: string;
    tagId?: string;
    styleId?: string;
    sortField?: string;
    sortOrder?: string;
  }): Promise<DocumentDTO[]> {
    const qs = new URLSearchParams();
    if (options?.search) qs.set('search', options.search);
    if (options?.tagId) qs.set('tagId', options.tagId);
    if (options?.styleId) qs.set('styleId', options.styleId);
    if (options?.sortField) qs.set('sortField', options.sortField);
    if (options?.sortOrder) qs.set('sortOrder', options.sortOrder);
    const params = qs.toString() ? `?${qs.toString()}` : '';
    const { data } = await apiClient.get<{
      success: boolean;
      data: { documents: DocumentDTO[] };
    }>(`/documents${params}`);
    return data.data.documents;
  },

  async getById(id: string): Promise<DocumentDTO> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { document: DocumentDTO };
    }>(`/documents/${id}`);
    return data.data.document;
  },

  async create(payload: CreateDocumentPayload): Promise<DocumentDTO> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { document: DocumentDTO };
    }>('/documents', payload);
    return data.data.document;
  },

  async update(
    id: string,
    payload: UpdateDocumentPayload
  ): Promise<DocumentDTO> {
    const { data } = await apiClient.put<{
      success: boolean;
      data: { document: DocumentDTO };
    }>(`/documents/${id}`, payload);
    return data.data.document;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },

  async reorder(documentIds: string[]): Promise<void> {
    await apiClient.post('/documents/reorder', { documentIds });
  },

  async listTrash(): Promise<DocumentDTO[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { documents: DocumentDTO[] };
    }>('/documents/trash');
    return data.data.documents;
  },

  async restore(id: string): Promise<void> {
    await apiClient.patch(`/documents/${id}`, { action: 'restore' });
  },

  async purge(id: string): Promise<void> {
    await apiClient.patch(`/documents/${id}`, { action: 'purge' });
  },

  async moveToBook(
    id: string,
    bookId: string | null,
    chapterOrder?: number | null
  ): Promise<void> {
    await apiClient.post(`/documents/${id}/move-to-book`, {
      bookId,
      chapterOrder,
    });
  },
};
