import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { ChatMessageItem } from "@/components/chat/ChatMessageItem";
import { User, Task } from "@/types";
import { ChatMessage } from "@/services/taskApi";

type ChatMessagesListProps = {
  messages: ChatMessage[];
  optimisticMessages: (ChatMessage & { optimistic?: boolean })[];
  user: User | null;
  deleteMessage: (id: string) => void;
  task: Task;
};

// Accept any optimistic property for unioned array item, during render only
type ChatMessageMaybeOptimistic = ChatMessage & { optimistic?: boolean };

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  optimisticMessages,
  user,
  deleteMessage,
  task,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, optimisticMessages]);

  // Combine server and optimistic messages into a single array, safely
  const sortedMsgs: ChatMessageMaybeOptimistic[] = [
    ...messages,
    ...optimisticMessages,
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <ScrollArea className="flex-1 bg-gray-50">
      <div className="p-4 sm:p-6">
        {sortedMsgs.length > 0 ? (
          <div className="space-y-4">
            {sortedMsgs.map((message, index, arr) => {
              const showAvatar =
                index === arr.length - 1 ||
                arr[index + 1].sender_id.user_id !== message.sender_id.user_id;
              return (
                <ChatMessageItem
                  key={message._id}
                  message={message}
                  user={user}
                  showAvatar={showAvatar}
                  // Only allow delete on non-optimistic server messages
                  onDelete={message.optimistic ? () => {} : deleteMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center py-20">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 inline-flex mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Start the conversation</h3>
              <p className="text-gray-600 max-w-sm text-sm">
                This is the beginning of your conversation about "{task.title}".
                Send your first message to get started!
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
