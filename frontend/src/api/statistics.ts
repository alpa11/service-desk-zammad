import { api } from './client';
import type { ApiResponse, Statistics, MyDashboard } from '../types';

export const statisticsApi = {
  getStatistics: async (filters: {
    from_date?: string;
    to_date?: string;
    branch_id?: number;
    housekeeper_id?: number;
  } = {}): Promise<Statistics> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const response = await api.get<ApiResponse<Statistics>>(`/statistics?${params.toString()}`);
    return response.data.data!;
  },

  getMyDashboard: async (): Promise<MyDashboard> => {
    const response = await api.get<ApiResponse<MyDashboard>>('/statistics/my-dashboard');
    return response.data.data!;
  },
};
