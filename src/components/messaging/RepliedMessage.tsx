
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
    <div className={`border-l-2 border-primary/50 pl-2 mb-2 bg-muted/30 rounded-r p-2 ${isOwn ? 'bg-primary/10' : 'bg-muted/50'
      }`}>
      {/* <p className="text-xs text-muted-foreground mb-1">
        {getSenderName(repliedMessage.sender_id)}
      </p> */}
      <p className="text-sm text-foreground/80 truncate">
        {getMessageContent(repliedMessage)}
      </p>
    </div>
  );
};
