import { useQuery } from '@tanstack/react-query';
import { issueTypesApi } from '../api/issueTypes';

export const useIssueTypes = (activeOnly: boolean = true) => {
  return useQuery({
    queryKey: ['issueTypes', activeOnly],
    queryFn: () => issueTypesApi.getIssueTypes(activeOnly),
  });
};
