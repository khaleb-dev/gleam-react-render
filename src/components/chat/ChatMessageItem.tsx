import React from 'react';
import { ChatMessage } from '@/services/taskApi';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileDisplay } from './FileDisplay';
import { LinkPreview } from './LinkPreview';
import { findFirstUrl } from './findFirstUrl';
import { ChatMessageText } from './ChatMessageText';

interface ChatMessageItemProps {
  message: ChatMessage;
  user: User | null;
  showAvatar: boolean;
  onDelete: (messageId: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  user,
  showAvatar,
  onDelete
}) => {
  // User's own message if sender_type is "users" (the user's own type from backend is "users")
  const isOwn = message.sender_type === "users";
  const sender = message.sender_id;
  const messageTime = format(new Date(message.createdAt), 'p');
  
  // Check if message is older than one day
  const messageDate = new Date(message.createdAt);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const canDelete = messageDate > oneDayAgo;

  // Look for a link to show preview
  const detectedUrl = findFirstUrl(message.message || "");

  // Generate unique color for sender name based on sender ID
  const getSenderColor = (senderId: string) => {
    const colors = [
      'text-blue-600', 'text-green-600', 'text-purple-600', 'text-red-600',
      'text-indigo-600', 'text-pink-600', 'text-yellow-600', 'text-teal-600',
      'text-orange-600', 'text-cyan-600', 'text-emerald-600', 'text-violet-600'
    ];
    let hash = 0;
    for (let i = 0; i < senderId.length; i++) {
      hash = ((hash << 5) - hash + senderId.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const senderName = `${sender?.first_name || ''} ${sender?.last_name || ''}`.trim() || 'Unknown User';
  const senderColor = getSenderColor(message.sender_id.user_id || message.sender_id._id);

  return (
    <div className="w-full">
      {/* Sender name - shown for all messages */}
      {!isOwn && (
        <div className="mb-1 ml-10">
          <span className={cn("text-xs font-medium", senderColor)}>
            {senderName}
          </span>
        </div>
      )}
      
      <div
        className={cn(
          'group flex w-full items-end gap-2',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
      {/* Avatar (left, for others only) */}
      {!isOwn && showAvatar ? (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={`https://robohash.org/${encodeURIComponent(sender?.first_name || 'user')}?set=set4&size=200x200`}
            alt=""
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="bg-secondary text-sm">
            {(sender?.first_name || 'U').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : !isOwn && <div className="w-8" />}

      {/* Chat bubble */}
      <div
        className={cn(
          'relative max-w-md rounded-xl p-3 space-y-1 shadow-sm transition-all',
          isOwn
            ? 'bg-primary text-white rounded-br-md ml-8'
            : 'bg-white border text-gray-900 rounded-bl-md mr-8'
        )}
        style={{
          borderTopRightRadius: isOwn ? 16 : undefined,
          borderBottomRightRadius: isOwn ? 6 : undefined,
          borderTopLeftRadius: !isOwn ? 16 : undefined,
          borderBottomLeftRadius: !isOwn ? 6 : undefined,
        }}
      >
        {/* Link preview appears ABOVE the chat text */}
        {detectedUrl && (
          <div className="pb-2">
            <LinkPreview url={detectedUrl} />
          </div>
        )}

        {/* Chat message text with links */}
        {message.message && (
          <p className="text-[13px] whitespace-pre-wrap leading-snug">
            <ChatMessageText text={message.message} isOwn={isOwn} />
          </p>
        )}

        {message.file_urls && message.file_urls.length > 0 && (
          <div className={message.message ? 'mt-2' : ''}>
            <FileDisplay fileUrls={message.file_urls} compact />
          </div>
        )}
        <p
          className={cn(
            'text-xs text-right pt-1',
            isOwn ? 'text-white/80' : 'text-muted-foreground'
          )}
          style={{ fontSize: "11px" }}
        >
          {messageTime}
        </p>
        {/* Delete button (for user's own message, show only on hover and within one day) */}
        {isOwn && canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 !bg-transparent hover:!bg-transparent focus-visible:!bg-transparent"
            onClick={() => onDelete(message._id)}
            aria-label="Delete message"
            tabIndex={-1}
            type="button"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      {/* Avatar (right, for own messages only) */}
      {isOwn && showAvatar ? (
        <Avatar className="h-8 w-8 flex-shrink-0 ml-1">
          <AvatarImage 
            src={`https://robohash.org/${encodeURIComponent(sender?.first_name || 'user')}?set=set3&size=200x200`} 
            alt=""
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {(user?.first_name || 'Y').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : isOwn && <div className="w-8" />}
      </div>
    </div>
  );
};
