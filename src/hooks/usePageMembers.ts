
import { useQuery } from "@tanstack/react-query";
import { getPageMembers } from "@/services/pageMembers";

export const usePageMembers = (pageId: string) => {
  return useQuery({
    queryKey: ['pageMembers', pageId],
    queryFn: () => getPageMembers(pageId),
    enabled: !!pageId,
  });
};
