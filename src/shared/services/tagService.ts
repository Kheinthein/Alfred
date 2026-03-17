import { apiClient } from './apiClient';

export interface TagDTO {
  id: string;
  name: string;
  color: string | null;
  documentCount?: number;
  createdAt?: string;
}

export const tagService = {
  async list(): Promise<TagDTO[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { tags: TagDTO[] };
    }>('/tags');
    return data.data.tags;
  },

  async create(payload: { name: string; color?: string }): Promise<TagDTO> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { tag: TagDTO };
    }>('/tags', payload);
    return data.data.tag;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },

  async update(
    id: string,
    payload: { name?: string; color?: string | null }
  ): Promise<TagDTO> {
    const { data } = await apiClient.patch<{
      success: boolean;
      data: { tag: TagDTO };
    }>(`/tags/${id}`, payload);
    return data.data.tag;
  },

  async getDocumentTags(documentId: string): Promise<TagDTO[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { tags: TagDTO[] };
    }>(`/documents/${documentId}/tags`);
    return data.data.tags;
  },

  async setDocumentTags(
    documentId: string,
    tagIds: string[]
  ): Promise<TagDTO[]> {
    const { data } = await apiClient.put<{
      success: boolean;
      data: { tags: TagDTO[] };
    }>(`/documents/${documentId}/tags`, { tagIds });
    return data.data.tags;
  },
};
