import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, ArrowLeft, Send, Phone, Video, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppContext } from '@/context/AppContext';

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

  // Mobile view - show only user list or chat
  if (isMobile) {
    if (selectedUserId && selectedUser) {
      return (
        <div className="flex flex-col h-screen bg-background">
          {/* Mobile Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/messages')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={selectedUser.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUser.first_name)}`}
                  className="object-cover"
                />
                <AvatarFallback>
                  {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedUser.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    message.sender_id === user?.user_id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      );
    }

    // Mobile Users List
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer border-b"
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user.first_name[0]}{user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm truncate">
                    {user.first_name} {user.last_name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {user.lastMessageTime}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.lastMessage}
                </p>
              </div>
              {user.unreadCount && user.unreadCount > 0 && (
                <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-medium">
                    {user.unreadCount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex h-screen bg-background">
      {/* Users Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`flex items-center gap-3 p-4 hover:bg-accent cursor-pointer border-b ${
                selectedUser?.user_id === user.user_id ? 'bg-accent' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user.first_name[0]}{user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm truncate">
                    {user.first_name} {user.last_name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {user.lastMessageTime}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.lastMessage}
                </p>
              </div>
              {user.unreadCount && user.unreadCount > 0 && (
                <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-medium">
                    {user.unreadCount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedUser.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUser.first_name)}`}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      message.sender_id === user?.user_id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex items-center gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          // No chat selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;