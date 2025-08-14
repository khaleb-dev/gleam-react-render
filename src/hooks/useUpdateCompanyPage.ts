import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompanyPage, UpdateCompanyPageRequest, UpdateCompanyPageResponse } from "@/services/companyPageApi";

export const useUpdateCompanyPage = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateCompanyPageResponse, Error, { pageId: string; data: UpdateCompanyPageRequest }>({
    mutationFn: ({ pageId, data }) => updateCompanyPage(pageId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch the company page data
      queryClient.invalidateQueries({ 
        queryKey: ['companyPage', variables.pageId] 
      });
      // Also invalidate queries that might use company_url as identifier
      queryClient.invalidateQueries({ 
        queryKey: ['companyPage'] 
      });
    },
  });
};