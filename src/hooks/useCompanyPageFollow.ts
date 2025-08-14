
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { followCompanyPage, unfollowCompanyPage, getFollowStatus } from "@/services/companyPageFollowApi";
import { toast } from "sonner";

export const useFollowStatus = (pageId: string) => {
  return useQuery({
    queryKey: ['companyPageFollowStatus', pageId],
    queryFn: () => getFollowStatus(pageId),
    enabled: !!pageId,
  });
};

export const useFollowCompanyPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followCompanyPage,
    onSuccess: (data, pageId) => {
      queryClient.invalidateQueries({ 
        queryKey: ['companyPageFollowStatus', pageId] 
      });
      toast.success('Company followed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to follow company');
    },
  });
};

export const useUnfollowCompanyPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowCompanyPage,
    onSuccess: (data, pageId) => {
      queryClient.invalidateQueries({ 
        queryKey: ['companyPageFollowStatus', pageId] 
      });
      toast.success('Company unfollowed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unfollow company');
    },
  });
};
