import React from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  isOwn: boolean;
  onReply: () => void;
  onDelete?: () => void;
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isOwn,
  onReply,
  onDelete,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReply}
        className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted/80"
        title="Reply to message"
      >
        <Reply className="h-3 w-3" />
      </Button>
      {isOwn && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="p-1 h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50"
          title="Delete message"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
