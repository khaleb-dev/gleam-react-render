import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendPageInvite } from "@/services/notificationApi";
import { toast } from "sonner";

interface SendInviteParams {
  userId: string;
  roleId: string;
  pageId: string;
}

export const useSendPageInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId, pageId }: SendInviteParams) => 
      sendPageInvite(userId, roleId, pageId),
    onSuccess: (data) => {
      toast.success('Invite sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invite');
    },
  });
};