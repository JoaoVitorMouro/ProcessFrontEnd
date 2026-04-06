import api from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  Process,
  ProcessFormData,
  ProcessFilters,
  BreadcrumbData,
} from '@/types';

export const processService = {
  list: (params?: ProcessFilters) =>
    api.get<PaginatedResponse<Process>>('/processes', { params }),

  get: (id: number) =>
    api.get<ApiResponse<Process>>(`/processes/${id}`),

  create: (data: ProcessFormData) =>
    api.post<ApiResponse<Process>>('/processes', data),

  update: (id: number, data: Partial<ProcessFormData>) =>
    api.put<ApiResponse<Process>>(`/processes/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/processes/${id}`),

  move: (id: number, data: { parent_id?: number | null; area_id?: number; order?: number }) =>
    api.patch<ApiResponse<Process>>(`/processes/${id}/move`, data),

  breadcrumb: (id: number) =>
    api.get<ApiResponse<BreadcrumbData>>(`/processes/${id}/breadcrumb`),
};
