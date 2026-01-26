import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '../api/branches';

export const useBranches = (filters: { active?: boolean; search?: string } = {}) => {
  return useQuery({
    queryKey: ['branches', filters],
    queryFn: () => branchesApi.getBranches(filters),
  });
};

export const useBranch = (id: number) => {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchesApi.getBranchById(id),
    enabled: !!id,
  });
};
