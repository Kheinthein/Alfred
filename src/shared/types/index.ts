/**
 * Types partagés de l'application
 */

export type AIProvider = 'openai' | 'claude' | 'mistral' | 'ollama' | 'gemini';

export type AnalysisType = 'syntax' | 'style' | 'progression';

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  readonly _brand?: 'RegisterPayload';
}

export interface WritingStyleDTO {
  id: string;
  name: string;
  description: string;
}

export interface DocumentDTO {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  style: WritingStyleDTO;
  version: number;
  sortOrder: number;
  bookId?: string | null;
  chapterOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookDTO {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  chapterCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookWithChaptersDTO extends BookDTO {
  chapters: DocumentDTO[];
}

export interface AIAnalysisDTO {
  id: string;
  type: AnalysisType;
  suggestions: string[];
  confidence: number;
  createdAt: string;
}

export interface AnalyzeResponse {
  analysis: AIAnalysisDTO;
  meta: {
    timestamp: string;
    processingTime: string;
  };
}

export interface ChatMessageDTO {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatConversationDTO {
  id: string;
  documentId: string;
  createdAt: string;
}
