import api from './api';
import type {
  ApiResponse,
  DashboardStats,
  DashboardOverviewArea,
} from '@/types';

export const dashboardService = {
  stats: () =>
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  overview: () =>
    api.get<ApiResponse<DashboardOverviewArea[]>>('/dashboard/overview'),
};
