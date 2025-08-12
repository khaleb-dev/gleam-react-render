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
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <p className="text-xs text-primary font-medium">
              Replying to {replyToMessage.sender_id.first_name}
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {replyToMessage.content || (replyToMessage.image_urls?.length ? '📷 Image' : 'Message')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-1 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
