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
    <div className="w-full bg-card">
      {hasUnread && (
        <div className="flex justify-end p-4 border-b border-border">
          <Button 
            onClick={onMarkAllAsRead}
            variant="ghost" 
            size="sm"
            className="text-xs h-8 px-3 text-primary hover:bg-accent"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border px-4 pt-2">
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="text-sm py-3 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent"
            >
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs px-2 py-0.5 h-5 bg-primary/10 text-primary">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="text-sm py-3 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="scores" 
              className="text-sm py-3 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent"
            >
              Scores
            </TabsTrigger>
            <TabsTrigger 
              value="linkups" 
              className="text-sm py-3 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent"
            >
              Linkups
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea className="h-[600px]">
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
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">All caught up!</h4>
                <p className="text-muted-foreground text-sm">
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
