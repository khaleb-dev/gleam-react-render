import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messageApi, MessageData, SendMessageRequest, UpdateMessageRequest } from '@/services/messageApi';

export const useConversation = (recipientId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch conversation messages
  const {
    data: messages = [],
    isLoading,
    error,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['conversation', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      
      const response = await messageApi.getConversation(recipientId);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    },
    enabled: !!recipientId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute as fallback
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await messageApi.sendMessage(data);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    },
    onSuccess: (newMessage) => {
      // Add new message to conversation cache
      queryClient.setQueryData<MessageData[]>(['conversation', recipientId], (prev = []) => [
        ...prev,
        newMessage
      ]);
      
      // Update inbox cache
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (error) => {
      console.error('Send message failed:', error);
      toast.error('Failed to send message.');
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await messageApi.deleteMessage(messageId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return messageId;
    },
    onMutate: async (messageId) => {
      // Optimistic update - remove message immediately
      const queryKey = ['conversation', recipientId];
      const previousMessages = queryClient.getQueryData<MessageData[]>(queryKey);
      
      queryClient.setQueryData<MessageData[]>(queryKey, (prev = []) =>
        prev.filter(m => m._id !== messageId)
      );
      
      return { previousMessages };
    },
    onSuccess: () => {
      toast.success('Message deleted.');
      // Update inbox cache
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (error, messageId, context) => {
      console.error('Delete message failed:', error);
      toast.error('Failed to delete message.');
      
      // Revert optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(['conversation', recipientId], context.previousMessages);
      }
    },
  });

  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, data }: { messageId: string; data: UpdateMessageRequest }) => {
      const response = await messageApi.updateMessage(messageId, data);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    },
    onSuccess: (updatedMessage) => {
      // Update message in conversation cache
      queryClient.setQueryData<MessageData[]>(['conversation', recipientId], (prev = []) =>
        prev.map(m => m._id === updatedMessage._id ? updatedMessage : m)
      );
      
      toast.success('Message updated.');
      // Update inbox cache
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (error) => {
      console.error('Update message failed:', error);
      toast.error('Failed to update message.');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async ({ senderId, chatType }: { senderId: string; chatType?: string }) => {
      if (!recipientId) throw new Error('No recipient ID');
      
      const response = await messageApi.markAsRead(senderId, recipientId, chatType);
      if (!response.success) {
        throw new Error(response.message);
      }
    },
    onSuccess: () => {
      // Update inbox cache
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      // Refetch conversation to update read status
      queryClient.invalidateQueries({ queryKey: ['conversation', recipientId] });
    },
    onError: (error) => {
      console.error('Mark as read failed:', error);
    },
  });

  // Handle query errors
  if (error) {
    console.error('Fetch conversation failed:', error);
    toast.error('Could not load conversation.');
  }

  // Helper to add new message to cache (for socket events)
  const addMessage = (newMessage: MessageData) => {
    if (newMessage.sender_id === recipientId || newMessage.recipient_id === recipientId) {
      queryClient.setQueryData<MessageData[]>(['conversation', recipientId], (prev = []) => [
        ...prev,
        newMessage
      ]);
    }
  };

  // Helper to remove message from cache (for socket events)
  const removeMessage = (messageId: string) => {
    queryClient.setQueryData<MessageData[]>(['conversation', recipientId], (prev = []) =>
      prev.filter(m => m._id !== messageId)
    );
  };

  return {
    messages,
    isLoading,
    error,
    refetchMessages,
    sendMessage: sendMessageMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
    deleteMessage: deleteMessageMutation.mutate,
    isDeletingMessage: deleteMessageMutation.isPending,
    updateMessage: updateMessageMutation.mutate,
    isUpdatingMessage: updateMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    addMessage,
    removeMessage,
  };
};