import api from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  Responsible,
  ResponsibleFormData,
} from '@/types';

export const responsibleService = {
  list: (params?: { search?: string; per_page?: number; page?: number }) =>
    api.get<PaginatedResponse<Responsible>>('/responsibles', { params }),

  get: (id: number) =>
    api.get<ApiResponse<Responsible>>(`/responsibles/${id}`),

  create: (data: ResponsibleFormData) =>
    api.post<ApiResponse<Responsible>>('/responsibles', data),

  update: (id: number, data: Partial<ResponsibleFormData>) =>
    api.put<ApiResponse<Responsible>>(`/responsibles/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/responsibles/${id}`),
};
