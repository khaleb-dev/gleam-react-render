import { useState } from 'react';
import { LinkedInNotificationItem } from './LinkedInNotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CheckCheck, Filter, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ApiNotification } from '@/services/notificationApi';

interface NotificationsListProps {
  notifications: ApiNotification[];
  onMarkAllAsRead: () => void;
  onReadNotification: (id: string) => void;
}

export const NotificationsList = ({
  notifications,
  onMarkAllAsRead,
  onReadNotification,
}: NotificationsListProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const hasUnread = notifications.some(notification => !notification.is_read);

  const filterNotifications = (notifications: ApiNotification[], filter: string) => {
    switch (filter) {
      case 'all':
        return notifications;
      case 'comments':
        return notifications.filter(n => n.type === 'comment');
      case 'scores':
        return notifications.filter(n => n.type === 'score');
      case 'linkups':
        return notifications.filter(n => n.type === 'linkups');
      default:
        return notifications;
    }
  };

  const filteredNotifications = filterNotifications(notifications, activeTab);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
          {hasUnread && (
            <Button 
              onClick={onMarkAllAsRead}
              variant="ghost" 
              size="sm"
              className="text-xs h-8 px-3 text-blue-600 hover:bg-blue-50"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-100 px-4 pt-2">
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="text-sm py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5 h-5">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="text-sm py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="scores" 
              className="text-sm py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              Scores
            </TabsTrigger>
            <TabsTrigger 
              value="linkups" 
              className="text-sm py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              Linkups
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea className="h-[500px] md:h-[400px]">
            {filteredNotifications.length > 0 ? (
              <div>
                {filteredNotifications.map((notification) => (
                  <LinkedInNotificationItem
                    key={notification._id}
                    notification={notification}
                    onRead={onReadNotification}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCheck className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h4>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'all' 
                    ? "You have no notifications" 
                    : `No ${activeTab} notifications`
                  }
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
