import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, MessageCircle, Phone, Video, Smile, Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { ChatMessageText } from '@/components/chat/ChatMessageText';
import { LinkPreview } from '@/components/chat/LinkPreview';
import { findFirstUrl } from '@/components/chat/findFirstUrl';

interface MessagePopupProps {
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    profile_avatar?: string;
    isOnline?: boolean;
  };
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

interface Message {
  _id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  timestamp: string;
  isRead: boolean;
}

export const MessagePopup: React.FC<MessagePopupProps> = ({
  user,
  onClose,
  onMinimize,
  isMinimized
}) => {
  const { user: currentUser } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages - replace with real API call
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        _id: '1',
        content: 'Hey! How are you doing?',
        sender_id: user.user_id,
        recipient_id: currentUser?.user_id || '',
        timestamp: '2025-01-01T10:00:00Z',
        isRead: true
      },
      {
        _id: '2',
        content: 'I\'m doing great! Thanks for asking.',
        sender_id: currentUser?.user_id || '',
        recipient_id: user.user_id,
        timestamp: '2025-01-01T10:01:00Z',
        isRead: true
      }
    ];
    setMessages(mockMessages);
  }, [user.user_id, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      _id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: currentUser?.user_id || '',
      recipient_id: user.user_id,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
        <div 
          className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={onMinimize}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                className="object-cover"
              />
              <AvatarFallback className="text-xs">
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-500">{user.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-black border border-gray-700 rounded-lg shadow-xl z-50 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                className="object-cover"
              />
              <AvatarFallback className="text-xs bg-gray-700 text-white">
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-black rounded-full" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-gray-400">@{user.first_name.toLowerCase()}{user.last_name.toLowerCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-white">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-white">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onMinimize} className="p-1 h-auto text-gray-400 hover:text-white">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUser?.user_id;
          const url = findFirstUrl(message.content);
          
          return (
            <div key={message._id} className="space-y-1">
              <div
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <Avatar className="h-6 w-6 mr-2 mt-1">
                    <AvatarImage
                      src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-700 text-white text-xs">
                      {user.first_name[0]}{user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <ChatMessageText text={message.content} isOwn={isOwn} />
                </div>
              </div>
              
              {/* Link Preview */}
              {url && (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && <div className="w-8" />}
                  <div className="max-w-[70%]">
                    <LinkPreview url={url} compact />
                  </div>
                </div>
              )}
              
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <p className={`text-xs text-gray-500 ${!isOwn ? 'ml-8' : ''}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage
                src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-700 text-white text-xs">
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-800 p-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-700">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center gap-2 bg-gray-900 rounded-full px-3 py-2">
            <Button type="button" variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
              <Paperclip className="h-3 w-3" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
              <Smile className="h-3 w-3" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Start a new message"
              className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 h-auto p-0 text-sm"
            />
            <Button type="submit" disabled={!newMessage.trim()} variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};