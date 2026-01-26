import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../api/statistics';

export const useStatistics = (filters: {
  from_date?: string;
  to_date?: string;
  branch_id?: number;
  housekeeper_id?: number;
} = {}) => {
  return useQuery({
    queryKey: ['statistics', filters],
    queryFn: () => statisticsApi.getStatistics(filters),
  });
};

export const useMyDashboard = () => {
  return useQuery({
    queryKey: ['myDashboard'],
    queryFn: () => statisticsApi.getMyDashboard(),
  });
};
