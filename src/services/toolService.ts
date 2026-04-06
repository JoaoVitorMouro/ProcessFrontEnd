import api from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  Tool,
  ToolFormData,
} from '@/types';

export const toolService = {
  list: (params?: { search?: string; per_page?: number; page?: number }) =>
    api.get<PaginatedResponse<Tool>>('/tools', { params }),

  get: (id: number) =>
    api.get<ApiResponse<Tool>>(`/tools/${id}`),

  create: (data: ToolFormData) =>
    api.post<ApiResponse<Tool>>('/tools', data),

  update: (id: number, data: Partial<ToolFormData>) =>
    api.put<ApiResponse<Tool>>(`/tools/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/tools/${id}`),
};
