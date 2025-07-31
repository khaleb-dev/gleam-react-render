import { useState, useEffect } from 'react';
import { getAllNotifications, getAllActivities, markAsRead, ApiNotification, Activity } from '@/services/notificationApi';
import { toast } from '@/components/ui/sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllNotifications();
      if (response.success) {
        setNotifications(response.data);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await getAllActivities();
      if (response.success) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notification => markAsRead(notification._id))
      );

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchActivities();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    activities,
    isLoading,
    error,
    unreadCount,
    fetchNotifications,
    fetchActivities,
    markNotificationAsRead,
    markAllAsRead,
  };
};
