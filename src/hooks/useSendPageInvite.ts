import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendPageInvite, sendBulkPageInvites } from "@/services/notificationApi";
import { toast } from "sonner";

interface SendInviteParams {
  userId: string;
  roleId: string;
  pageId: string;
}

interface SendBulkInviteParams {
  pageId: string;
  invites: Array<{ user_id: string; role_id: string }>;
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

export const useSendBulkPageInvites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, invites }: SendBulkInviteParams) => 
      sendBulkPageInvites(pageId, invites),
    onSuccess: (data) => {
      toast.success(`${data.data?.count || 1} invite(s) sent successfully!`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPageMembers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invites');
    },
  });
};