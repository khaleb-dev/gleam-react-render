import React from 'react';
import { MessageData } from '@/services/messageApi';

interface RepliedMessageProps {
  repliedMessage: MessageData;
  isOwn: boolean;
}

export const RepliedMessage: React.FC<RepliedMessageProps> = ({
  repliedMessage,
  isOwn
}) => {
  const getSenderName = (senderData: any) => {
    if (typeof senderData === 'string') {
      return 'User';
    }
    return senderData?.first_name || 'User';
  };

  const getMessageContent = (message: MessageData) => {
    if (message.content && message.content.trim()) {
      return message.content;
    }
    if (message.image_urls?.length) {
      return '📷 Image';
    }
    return 'Message';
  };

  return (
    <div className="mb-3">
      {/* Thread line connector */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center pt-2">
          <div className="w-6 h-6 rounded-full border-2 border-primary/30 bg-background flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary/60"></div>
          </div>
          <div className="w-px h-4 bg-primary/20 mt-1"></div>
        </div>

        {/* Replied message content */}
        <div className={`flex-1 rounded-xl p-3 border ${isOwn
          ? 'bg-primary/5 border-primary/20'
          : 'bg-muted/50 border-border'
          }`}>
          <div className="flex items-center gap-2 mb-1">
            {/* <div className="w-1 h-1 bg-primary rounded-full"></div> */}
            {/* <p className="text-xs text-primary font-medium">
              {getSenderName(repliedMessage.sender_id)}
            </p> */}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {getMessageContent(repliedMessage)}
          </p>
        </div>
      </div>
    </div>
  );
};
