import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendPageInvite, sendMultiplePageInvites } from "@/services/notificationApi";
import { toast } from "sonner";

interface SendInviteParams {
  userId: string;
  roleId: string;
  pageId: string;
}

interface SendMultipleInvitesParams {
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

export const useSendMultiplePageInvites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, invites }: SendMultipleInvitesParams) => 
      sendMultiplePageInvites(pageId, invites),
    onSuccess: (data) => {
      toast.success('Invites sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invites');
    },
  });
};