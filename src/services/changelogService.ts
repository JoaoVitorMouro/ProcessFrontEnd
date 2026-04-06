import api from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  ProcessChange,
} from '@/types';

export const changelogService = {
  getProcessChangelog: (processId: number, page: number = 1) =>
    api.get<PaginatedResponse<ProcessChange>>(
      `/processes/${processId}/changelog`, { params: { page } }
    ),

  getAllChanges: (days: number = 30, page: number = 1) =>
    api.get<PaginatedResponse<ProcessChange & { process_id: number; process_name: string }>>(
      '/changelog', { params: { days, page } }
    ),

  restoreVersion: (processId: number, changeId: number) =>
    api.post<ApiResponse<{ message: string; process: any }>>(
      `/processes/${processId}/changelog/${changeId}/restore`
    ),
};
