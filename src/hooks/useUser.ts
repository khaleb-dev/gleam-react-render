
import { useQuery } from "@tanstack/react-query";
import { userApiService } from "@/services/userApi";

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApiService.getUserById(userId),
    enabled: !!userId,
    select: (data) => data?.data || null,
  });
};
