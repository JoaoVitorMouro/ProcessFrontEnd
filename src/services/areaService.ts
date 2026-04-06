import api from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  Area,
  AreaFormData,
  Process,
} from '@/types';

export const areaService = {
  list: (params?: { search?: string; per_page?: number; page?: number }) =>
    api.get<PaginatedResponse<Area>>('/areas', { params }),

  get: (id: number) =>
    api.get<ApiResponse<Area>>(`/areas/${id}`),

  create: (data: AreaFormData) =>
    api.post<ApiResponse<Area>>('/areas', data),

  update: (id: number, data: Partial<AreaFormData>) =>
    api.put<ApiResponse<Area>>(`/areas/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/areas/${id}`),

  tree: (id: number) =>
    api.get<ApiResponse<Area & { processes: Process[] }>>(`/areas/${id}/tree`),
};
