
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, Calendar, MessageSquare, Users, Star, FileText, AlertTriangle, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ApiNotification } from '@/services/notificationApi';

export interface Notification {
  id: string;
  type: 'task-accepted' | 'task-completed' | 'message' | 'deadline';
  title: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  taskId?: string;
  responderId?: string;
}

interface NotificationItemProps {
  notification: ApiNotification;
  onRead: (id: string) => void;
}

export const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification._id);
    }

    // Navigate based on notification link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'task':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'linkups':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'score':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-beembyte-blue" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div
      className={cn(
        "p-4 border-b border-gray-100 transition-all cursor-pointer hover:bg-gray-50",
        !notification.is_read && "bg-blue-50/30"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Sender Avatar */}
        <div className="flex-shrink-0">
          {notification.sender_id ? (
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={notification.sender_id.profile_avatar ? notification.sender_id.profile_avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(notification.sender_id.first_name)}`}
                alt={`${notification.sender_id.first_name} ${notification.sender_id.last_name}`}
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="text-sm bg-gray-100">
                {notification.sender_id.first_name?.[0]}
                {notification.sender_id.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              {getIcon()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "text-sm leading-tight mb-1 break-words",
                !notification.is_read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-2 break-words overflow-hidden">
                {notification.message}
              </p>

              {/* Reference content preview */}
              {notification.reference_id?.post_id && (
                <div className="bg-gray-50 rounded-lg p-3 mt-2 border-l-4 border-blue-500">
                  <p className="text-xs text-gray-500 mb-1">Post</p>
                  <p className="text-sm font-medium text-gray-700 line-clamp-2 break-words">
                    {notification.reference_id.post_id.title}
                  </p>
                  {notification.reference_id.post_id.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1 break-words">
                      {notification.reference_id.post_id.description}
                    </p>
                  )}
                </div>
              )}

              {/* Score display */}
              {notification.type === 'score' && notification.reference_id?.score && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-yellow-600">
                    {notification.reference_id.score} stars
                  </span>
                </div>
              )}

              {/* Comment content */}
              {notification.type === 'comment' && notification.reference_id?.content && (
                <div className="bg-gray-50 rounded-lg p-3 mt-2 border-l-4 border-green-500">
                  <p className="text-xs text-gray-500 mb-1">Comment</p>
                  <p className="text-sm text-gray-700 italic break-words">
                    "{notification.reference_id.content}"
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {getTimeAgo(notification.created_at)}
                </span>
                {!notification.is_read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                )}
              </div>
            </div>

            {/* Notification type icon */}
            <div className="flex-shrink-0 ml-2">
              <div className={cn(
                "p-1.5 rounded-full",
                notification.type === 'score' && "bg-yellow-100",
                notification.type === 'comment' && "bg-blue-100",
                notification.type === 'linkups' && "bg-purple-100",
                notification.type === 'task' && "bg-green-100",
                notification.type === 'system' && "bg-gray-100",
                notification.type === 'alert' && "bg-red-100"
              )}>
                {getIcon()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
