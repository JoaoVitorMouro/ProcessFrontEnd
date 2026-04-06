import api from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  Document,
  DocumentFormData,
} from '@/types';

export const documentService = {
  list: (params?: { search?: string; per_page?: number; page?: number }) =>
    api.get<PaginatedResponse<Document>>('/documents', { params }),

  get: (id: number) =>
    api.get<ApiResponse<Document>>(`/documents/${id}`),

  create: (data: DocumentFormData) =>
    api.post<ApiResponse<Document>>('/documents', data),

  update: (id: number, data: Partial<DocumentFormData>) =>
    api.put<ApiResponse<Document>>(`/documents/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/documents/${id}`),
};
