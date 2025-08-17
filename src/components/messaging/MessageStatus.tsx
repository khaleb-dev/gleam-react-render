import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageData } from '@/services/messageApi';

interface MessageStatusProps {
  message: MessageData;
  isOwn: boolean;
  currentUserId?: string;
  onRetry?: () => void;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ message, isOwn, currentUserId, onRetry }) => {
  // Only show status for own messages
  if (!isOwn) return null;

  const getStatusIcon = () => {
    const iconClass = "h-3 w-3";
    
    switch (message.status) {
      case 'sending':
        return <Clock className={`${iconClass} text-muted-foreground animate-pulse`} />;
      case 'sent':
        return <Check className={`${iconClass} text-muted-foreground`} />;
      case 'delivered':
        return <CheckCheck className={`${iconClass} text-muted-foreground`} />;
      case 'read':
        return <CheckCheck className={`${iconClass} text-primary`} />;
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <AlertCircle className={`${iconClass} text-destructive`} />
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="p-0 h-auto text-xs text-destructive hover:text-destructive/80"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        );
      default:
        // Check read_by array to see if any recipient has read the message
        const hasBeenRead = message.read_by && message.read_by.length > 0;
        
        if (hasBeenRead) {
          return <CheckCheck className={`${iconClass} text-primary`} />;
        } else if (message.isDelivered) {
          return <CheckCheck className={`${iconClass} text-muted-foreground`} />;
        } else {
          return <Check className={`${iconClass} text-muted-foreground`} />;
        }
    }
  };

  return (
    <div className="flex items-center justify-end mt-1">
      {getStatusIcon()}
    </div>
  );
};
