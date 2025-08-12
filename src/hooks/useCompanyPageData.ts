
import { useQuery } from "@tanstack/react-query";
import { getCompanyPage } from "@/services/companyPageApi";

export const useCompanyPageData = (identifier: string) => {
  return useQuery({
    queryKey: ['companyPage', identifier],
    queryFn: () => getCompanyPage(identifier),
    enabled: !!identifier,
  });
};
