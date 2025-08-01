import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, ArrowLeft, Send, Phone, Video, MoreHorizontal, Settings, Edit, Smile, Paperclip, Mic, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppContext } from '@/context/AppContext';
import { ChatMessageText } from '@/components/chat/ChatMessageText';
import { LinkPreview } from '@/components/chat/LinkPreview';
import { findFirstUrl } from '@/components/chat/findFirstUrl';

interface MessageUser {
  _id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  profile_avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface Message {
  _id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  timestamp: string;
  isRead: boolean;
}

const Messages = () => {
  const { userId: selectedUserId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<MessageUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mock users data - replace with real API call
  const [users] = useState<MessageUser[]>([
    {
      _id: '1',
      user_id: '1',
      first_name: 'John',
      last_name: 'Doe',
      profile_avatar: '',
      lastMessage: 'Hey! How are you doing?',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isOnline: true
    },
    {
      _id: '2',
      user_id: '2',
      first_name: 'Jane',
      last_name: 'Smith',
      profile_avatar: '',
      lastMessage: 'Thanks for your help earlier',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isOnline: false
    },
    {
      _id: '3',
      user_id: '3',
      first_name: 'Mike',
      last_name: 'Johnson',
      profile_avatar: '',
      lastMessage: 'Can we discuss the project?',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      isOnline: true
    }
  ]);

  // Mock messages data - replace with real API call
  const [allMessages] = useState<Message[]>([
    {
      _id: '1',
      content: 'Hey! How are you doing?',
      sender_id: '1',
      recipient_id: user?.user_id || '',
      timestamp: '2025-01-01T10:00:00Z',
      isRead: true
    },
    {
      _id: '2',
      content: 'I\'m doing great! How about you?',
      sender_id: user?.user_id || '',
      recipient_id: '1',
      timestamp: '2025-01-01T10:01:00Z',
      isRead: true
    },
    {
      _id: '3',
      content: 'Working on some exciting projects. Want to collaborate?',
      sender_id: '1',
      recipient_id: user?.user_id || '',
      timestamp: '2025-01-01T10:02:00Z',
      isRead: false
    }
  ]);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find(u => u.user_id === selectedUserId);
      if (user) {
        setSelectedUser(user);
        // Filter messages for this user
        const userMessages = allMessages.filter(
          m => (m.sender_id === selectedUserId && m.recipient_id === user?.user_id) ||
            (m.sender_id === user?.user_id && m.recipient_id === selectedUserId)
        );
        setMessages(userMessages);
      }
    }
  }, [selectedUserId, users, allMessages, user]);

  const filteredUsers = users.filter(u =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (selectedUser: MessageUser) => {
    if (isMobile) {
      navigate(`/messages/${selectedUser.user_id}`);
    } else {
      setSelectedUser(selectedUser);
      // Filter messages for this user
      const userMessages = allMessages.filter(
        m => (m.sender_id === selectedUser.user_id && m.recipient_id === user?.user_id) ||
          (m.sender_id === user?.user_id && m.recipient_id === selectedUser.user_id)
      );
      setMessages(userMessages);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const message: Message = {
      _id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: user?.user_id || '',
      recipient_id: selectedUser.user_id,
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

  // Desktop view
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Users Sidebar */}
      <div className="w-96 border-r border-gray-700 flex flex-col bg-black">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-500"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        {/* <div className="px-6 py-3 border-b border-gray-700">
          <div className="flex space-x-8">
            <button className="text-white font-medium border-b-2 border-blue-500 pb-2">
              Primary
            </button>
            <button className="text-gray-400 hover:text-gray-300 pb-2">
              Task
            </button>
            <button className="text-gray-400 hover:text-gray-300 pb-2">
              Groups
            </button>
          </div>
        </div> */}

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400 text-sm">No conversations found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-900 cursor-pointer transition-colors ${selectedUser?.user_id === user.user_id ? 'bg-gray-900' : ''
                  }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {user.first_name[0]}{user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-white truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {user.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {user.lastMessage}
                  </p>
                </div>
                {user.unreadCount && user.unreadCount > 0 && (
                  <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {user.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedUser.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUser.first_name)}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    @{selectedUser.first_name.toLowerCase()}{selectedUser.last_name.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
              {messages.map((message) => {
                const isOwn = message.sender_id === user?.user_id;
                const url = findFirstUrl(message.content);

                return (
                  <div key={message._id} className="space-y-2">
                    <div
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage
                            src={selectedUser.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUser.first_name)}`}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gray-700 text-white text-xs">
                            {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${isOwn
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-100'
                          }`}
                      >
                        <div className="text-sm">
                          <ChatMessageText text={message.content} isOwn={isOwn} />
                        </div>
                      </div>
                    </div>

                    {/* Link Preview */}
                    {url && (
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {!isOwn && <div className="w-10" />}
                        <div className="max-w-xs">
                          <LinkPreview url={url} compact />
                        </div>
                      </div>
                    )}

                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <p className={`text-xs text-gray-500 ${!isOwn ? 'ml-10' : ''}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={handleSendMessage}>
                <div className="flex items-center gap-3 bg-gray-900 rounded-full px-4 py-2">

                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Start a new message"
                    className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 h-auto p-0"
                  />
                  <Button type="button" variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          // No chat selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Welcome to your inbox!
                </h1>
                <p className="text-gray-400 text-lg">
                  Drop a line, share posts and more with private conversations between you and others.
                </p>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold">
                Write a message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;