import { api } from './client';
import type { ApiResponse, Branch } from '../types';

export const branchesApi = {
  getBranches: async (filters: { active?: boolean; search?: string } = {}): Promise<Branch[]> => {
    const params = new URLSearchParams();
    if (filters.active !== undefined) {
      params.append('active', String(filters.active));
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    const response = await api.get<ApiResponse<Branch[]>>(`/branches?${params.toString()}`);
    return response.data.data!;
  },

  getBranchById: async (id: number): Promise<Branch> => {
    const response = await api.get<ApiResponse<Branch>>(`/branches/${id}`);
    return response.data.data!;
  },

  createBranch: async (data: Partial<Branch>): Promise<Branch> => {
    const response = await api.post<ApiResponse<Branch>>('/branches', data);
    return response.data.data!;
  },

  updateBranch: async (id: number, data: Partial<Branch>): Promise<Branch> => {
    const response = await api.put<ApiResponse<Branch>>(`/branches/${id}`, data);
    return response.data.data!;
  },

  deleteBranch: async (id: number): Promise<void> => {
    await api.delete(`/branches/${id}`);
  },
};
