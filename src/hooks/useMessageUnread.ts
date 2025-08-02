
import { useState, useEffect } from 'react';
import { messageApi } from '@/services/messageApi';
import { useAppContext } from '@/context/AppContext';

export const useMessageUnread = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAppContext();

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await messageApi.getInbox();
      if (response.success && response.data) {
        const totalUnread = response.data.reduce((total, inbox) => total + inbox.unreadCount, 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Only return count if it's greater than 0
  return { 
    unreadCount: unreadCount > 0 ? unreadCount : 0, 
    refreshUnreadCount: fetchUnreadCount,
    hasUnread: unreadCount > 0
  };
};
