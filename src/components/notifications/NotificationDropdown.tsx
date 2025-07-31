import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { NotificationsList } from './NotificationsList';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markNotificationAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleReadNotification = (id: string) => {
    markNotificationAsRead(id);
    setOpen(false);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : (
          <>
            <NotificationsList
              notifications={notifications.slice(0, 5)}
              onMarkAllAsRead={markAllAsRead}
              onReadNotification={handleReadNotification}
            />
            <div className="p-3 border-t bg-gray-50">
              <Button 
                variant="ghost" 
                className="w-full text-sm hover:bg-gray-100"
                onClick={handleViewAll}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
