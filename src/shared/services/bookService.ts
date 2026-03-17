import { BookDTO, BookWithChaptersDTO } from '@shared/types';
import { apiClient } from './apiClient';

interface CreateBookPayload {
  title: string;
  description?: string | null;
}

interface UpdateBookPayload {
  title?: string;
  description?: string | null;
}

export const bookService = {
  async list(): Promise<BookDTO[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { books: BookDTO[] };
    }>('/books');
    return data.data.books;
  },

  async getById(id: string): Promise<BookWithChaptersDTO> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { book: BookWithChaptersDTO };
    }>(`/books/${id}`);
    return data.data.book;
  },

  async create(payload: CreateBookPayload): Promise<BookDTO> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { book: BookDTO };
    }>('/books', payload);
    return data.data.book;
  },

  async update(id: string, payload: UpdateBookPayload): Promise<BookDTO> {
    const { data } = await apiClient.put<{
      success: boolean;
      data: { book: BookDTO };
    }>(`/books/${id}`, payload);
    return data.data.book;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/books/${id}`);
  },

  async reorder(bookIds: string[]): Promise<void> {
    await apiClient.put('/books/reorder', { bookIds });
  },
};
