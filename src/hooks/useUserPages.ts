import { useQuery } from "@tanstack/react-query";
import { getUserPages, UserPagesResponse } from "@/services/companyPageApi";

export const useUserPages = () => {
  return useQuery({
    queryKey: ['userPages'],
    queryFn: getUserPages,
  });
};