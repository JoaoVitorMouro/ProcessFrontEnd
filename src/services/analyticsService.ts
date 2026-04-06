import api from './api';
import type { ApiResponse, AnalyticsInsight } from '@/types';

export const analyticsService = {
  getInsights: async (): Promise<AnalyticsInsight[]> => {
    const response = await api.get<ApiResponse<{ insights: AnalyticsInsight[] }>>(
      '/analytics/insights'
    );
    return response.data.data.insights || [];
  },
};
