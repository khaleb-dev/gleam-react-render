import { useQueryClient } from '@tanstack/react-query';
import { useConversation } from './useConversation';
import { useInbox } from './useInbox';
import { MessageData, messageApi } from '@/services/messageApi';

export const useMessaging = (recipientId?: string) => {
  const queryClient = useQueryClient();
  const inbox = useInbox();
  const conversation = useConversation(recipientId);

  // Helper to handle socket events for real-time updates
  const handleSocketMessage = (newMessage: MessageData) => {
    // Update the relevant conversation cache
    const conversationKey = ['conversation', newMessage.sender_id];
    const recipientConversationKey = ['conversation', newMessage.recipient_id];
    
    // Add to sender's conversation cache
    queryClient.setQueryData<MessageData[]>(conversationKey, (prev = []) => [
      ...prev,
      newMessage
    ]);
    
    // Add to recipient's conversation cache
    queryClient.setQueryData<MessageData[]>(recipientConversationKey, (prev = []) => [
      ...prev,
      newMessage
    ]);
    
    // Invalidate inbox to update with new message
    queryClient.invalidateQueries({ queryKey: ['inbox'] });
  };

  const handleSocketMessageDeleted = (data: { messageId: string; conversationId: string }) => {
    // Remove from conversation caches
    queryClient.setQueryData<MessageData[]>(['conversation', data.conversationId], (prev = []) =>
      prev.filter(m => m._id !== data.messageId)
    );
    
    // Invalidate inbox
    queryClient.invalidateQueries({ queryKey: ['inbox'] });
  };

  const handleSocketMessageRead = (data: { senderId: string; recipientId: string }) => {
    // Invalidate relevant conversation and inbox caches
    queryClient.invalidateQueries({ queryKey: ['conversation', data.senderId] });
    queryClient.invalidateQueries({ queryKey: ['conversation', data.recipientId] });
    queryClient.invalidateQueries({ queryKey: ['inbox'] });
  };

  // Clear all messaging caches
  const clearMessagingCache = () => {
    queryClient.invalidateQueries({ queryKey: ['inbox'] });
    queryClient.invalidateQueries({ queryKey: ['conversation'] });
  };

  // Prefetch conversation data
  const prefetchConversation = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['conversation', userId],
      queryFn: async () => {
        const response = await messageApi.getConversation(userId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message);
      },
      staleTime: 30 * 1000,
    });
  };

  return {
    // Inbox functionality
    ...inbox,
    
    // Conversation functionality (when recipientId is provided)
    ...conversation,
    
    // Socket event handlers
    handleSocketMessage,
    handleSocketMessageDeleted,
    handleSocketMessageRead,
    
    // Utility functions
    clearMessagingCache,
    prefetchConversation,
  };
};