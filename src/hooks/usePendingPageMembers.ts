import { useQuery } from "@tanstack/react-query";
import { getPendingPageMembers } from "@/services/pageMembers";

export const usePendingPageMembers = (pageId: string) => {
  return useQuery({
    queryKey: ['pendingPageMembers', pageId],
    queryFn: () => getPendingPageMembers(pageId),
    enabled: !!pageId,
  });
};