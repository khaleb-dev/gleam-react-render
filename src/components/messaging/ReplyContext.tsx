
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageData } from '@/services/messageApi';

interface ReplyContextProps {
  replyToMessage: MessageData;
  onCancel: () => void;
}

export const ReplyContext: React.FC<ReplyContextProps> = ({
  replyToMessage,
  onCancel
}) => {
  return (
    <div className="bg-muted/50 border-l-4 border-primary p-3 mx-4 mb-2 rounded-r">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">
            Replying to {replyToMessage.sender_id.first_name}
          </p>
          <p className="text-sm text-foreground truncate">
            {replyToMessage.content || (replyToMessage.image_urls?.length ? '📷 Image' : 'Message')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
