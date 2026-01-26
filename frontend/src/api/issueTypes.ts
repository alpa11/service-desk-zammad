import { api } from './client';
import type { ApiResponse, IssueType } from '../types';

export const issueTypesApi = {
  getIssueTypes: async (activeOnly: boolean = true): Promise<IssueType[]> => {
    const params = activeOnly ? '' : '?active=false';
    const response = await api.get<ApiResponse<IssueType[]>>(`/issue-types${params}`);
    return response.data.data!;
  },

  createIssueType: async (data: Partial<IssueType>): Promise<IssueType> => {
    const response = await api.post<ApiResponse<IssueType>>('/issue-types', data);
    return response.data.data!;
  },

  updateIssueType: async (id: number, data: Partial<IssueType>): Promise<IssueType> => {
    const response = await api.put<ApiResponse<IssueType>>(`/issue-types/${id}`, data);
    return response.data.data!;
  },

  deleteIssueType: async (id: number): Promise<void> => {
    await api.delete(`/issue-types/${id}`);
  },
};
