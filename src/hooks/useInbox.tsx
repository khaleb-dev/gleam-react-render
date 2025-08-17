import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messageApi, InboxUser } from '@/services/messageApi';

export const useInbox = () => {
  const queryClient = useQueryClient();

  const {
    data: inbox = [],
    isLoading,
    error,
    refetch: refetchInbox
  } = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      const response = await messageApi.getInbox();
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes as fallback
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Handle query errors
  if (error) {
    console.error('Fetch inbox failed:', error);
    toast.error('Could not load inbox.');
  }

  // Helper to update inbox item
  const updateInboxItem = (recipientId: string, updates: Partial<InboxUser>) => {
    queryClient.setQueryData<InboxUser[]>(['inbox'], (prev = []) =>
      prev.map(item =>
        item.participant._id === recipientId ? { ...item, ...updates } : item
      )
    );
  };

  // Helper to add new inbox item or update existing
  const upsertInboxItem = (newItem: InboxUser) => {
    queryClient.setQueryData<InboxUser[]>(['inbox'], (prev = []) => {
      const existingIndex = prev.findIndex(
        item => item.participant._id === newItem.participant._id
      );
      
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      } else {
        // Add new item to the beginning
        return [newItem, ...prev];
      }
    });
  };

  return {
    inbox,
    isLoading,
    error,
    refetchInbox,
    updateInboxItem,
    upsertInboxItem,
  };
};