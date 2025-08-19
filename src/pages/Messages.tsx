import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/context/AppContext';
import { messageApi, InboxUser } from '@/services/messageApi';
import { MessagesContainer } from '@/components/messaging/MessagesContainer';
import { useMessageUnread } from '@/hooks/useMessageUnread';
import { MessagePopup } from '@/components/messaging/MessagePopup';
import { MessageStatus } from '@/components/messaging/MessageStatus';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Messages() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const { userId: paramUserId } = useParams();
  const [conversations, setConversations] = useState<InboxUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const { unreadCount, refreshUnreadCount } = useMessageUnread();
  const [minimizedChats, setMinimizedChats] = useState<Set<string>>(new Set());
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [initialUser, setInitialUser] = useState<{
    user_id: string;
    first_name: string;
    last_name: string;
    profile_avatar?: string;
  } | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const response = await messageApi.getInbox();
      if (response.success && response.data) {
        // Sort conversations by most recent activity
        const sortedConversations = response.data.sort((a, b) =>
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [user]);

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      await fetchConversations();
      setIsLoading(false);
    };

    loadConversations();
  }, [fetchConversations]);

  // Helper function to check if participant is a user
  const isUserParticipant = (participant: any): participant is { _id: string; first_name: string; last_name: string; email?: string; profile_avatar?: string } => {
    return participant && typeof participant.first_name === 'string';
  };

  // Helper function to get display name
  const getDisplayName = (participant: any) => {
    if (!participant) return 'Unknown';
    if (isUserParticipant(participant)) {
      return `${participant.first_name || ''} ${participant.last_name || ''}`.trim();
    }
    return participant.name || 'Unknown';
  };

  // Helper function to get avatar
  const getAvatar = (participant: any) => {
    if (!participant) return undefined;
    if (isUserParticipant(participant)) {
      return participant.profile_avatar;
    }
    return participant.logo;
  };

  // Function to update conversation with new message
  const updateConversationWithNewMessage = useCallback((recipientId: string, newMessage: string) => {
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => {
        if (conv.participant?._id === recipientId) {
          return {
            ...conv,
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString()
          };
        }
        return conv;
      });

      // Sort by most recent activity
      return updatedConversations.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    });
  }, []);

  // Handle userId from URL params or query params

  useEffect(() => {
    const userId = paramUserId || searchParams.get('userId');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const profileAvatar = searchParams.get('profileAvatar');
    const isPage = searchParams.get('isPage') === 'true';
    const chatType = searchParams.get('chatType');

    if (!userId) return;

    const existingConversation = conversations.find(
      (conv) => conv.participant?._id === userId
    );

    if (existingConversation) {
      handleUserSelect(existingConversation);
    } else if (firstName) {
      const newUser = {
        user_id: userId,
        first_name: firstName,
        last_name: lastName || '',
        profile_avatar: profileAvatar || undefined,
        isOnline: false,
        ...(isPage && {
          isPage: true,
          chat_type: chatType || 'page_channel',
          chat_type_ref: 'Page'
        })
      };
      setSelectedUser(newUser);
      // Always hide sidebar on mobile when user is selected
      setShowSidebar(false);
    } else if (userId) {
      // If we have userId but no user details, create a placeholder user
      // This ensures the chat interface opens even without existing conversation
      const placeholderUser = {
        user_id: userId,
        first_name: 'User',
        last_name: '',
        profile_avatar: undefined,
        isOnline: false,
      };
      setSelectedUser(placeholderUser);
      // Always hide sidebar on mobile when user is selected
      setShowSidebar(false);
    }

    // Clear the query params after selecting
    if (!paramUserId && searchParams.get('userId')) {
      navigate('/messages', { replace: true });
    }
  }, [paramUserId, searchParams.toString(), conversations]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    if (!conversation.participant) return false;
    const displayName = getDisplayName(conversation.participant).toLowerCase();
    return displayName.includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUserSelect = async (conversation: InboxUser) => {
    if (!conversation.participant) return;

    let userToSelect: any;

    if (isUserParticipant(conversation.participant)) {
      // Handle user conversation
      userToSelect = {
        user_id: conversation.participant._id,
        first_name: conversation.participant.first_name,
        last_name: conversation.participant.last_name,
        profile_avatar: conversation.participant.profile_avatar,
        isOnline: false
      };
    } else {
      // Handle page conversation - cast to MessagePage type
      const pageParticipant = conversation.participant as { _id: string; name: string; logo?: string };
      userToSelect = {
        user_id: pageParticipant._id,
        first_name: pageParticipant.name,
        last_name: '',
        profile_avatar: pageParticipant.logo,
        isOnline: false,
        isPage: true,
        chat_type: conversation.chat_type,
        chat_type_ref: conversation.chat_type_ref
      };
    }

    setSelectedUser(userToSelect);

    // On mobile, hide sidebar when a user is selected
    if (isMobile) {
      setShowSidebar(false);
    }

    // Mark messages as read
    try {
      // Mark messages as read between current user and selected participant
      const recipientId =
        conversation.chat_type_ref === 'Page' ? conversation.participant._id : user._id;

      const senderId =
        conversation.chat_type_ref === 'Page' ? user._id : conversation.participant._id;

      const chatType =
        conversation.chat_type_ref === 'Page' ? 'page_channel' : 'private';

      if (senderId) {
        await messageApi.markAsRead(senderId, recipientId, chatType);
      }
      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.participant?._id === conversation.participant?._id
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    if (isMobile) {
      setShowSidebar(true);
    }
  };

  const handleBackToInbox = () => {
    setSelectedUser(null);
    setShowSidebar(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Hidden on mobile when chat is selected */}
      {(!isMobile || showSidebar) && (
        <div className={`${isMobile ? 'w-full' : 'w-80'} border-r border-border flex flex-col bg-background`}>
          {/* Header */}
          <div className="p-4 border-b border-border bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold text-foreground">Messages</h1>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No conversations</h3>
                <p className="text-sm text-muted-foreground">Start a new conversation to get started.</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => {
                  if (!conversation.participant) return null;

                  const displayName = getDisplayName(conversation.participant);
                  const avatar = getAvatar(conversation.participant);
                  const isUser = isUserParticipant(conversation.participant);

                  return (
                    <div
                      key={conversation.participant._id}
                      onClick={() => handleUserSelect(conversation)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${selectedUser?.user_id === conversation.participant._id ? 'bg-muted' : ''
                        }`}
                    >
                      <div className="relative">
                        <Avatar className={`h-12 w-12 ${conversation.unreadCount > 0 ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                          <AvatarImage
                            src={avatar || (isUser ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}` : undefined)}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center">
                            <span className="text-xs text-destructive-foreground font-medium">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground truncate">
                              {displayName}
                            </h3>
                            {conversation.chat_type_ref === 'Page' && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Channel
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area - Full width on mobile when sidebar is hidden */}
      {(!isMobile || !showSidebar) && (
        <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col bg-background`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-background flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToInbox}
                      className="p-2 hover:bg-muted"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedUser.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUser.first_name)}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2
                      className="font-semibold text-foreground cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${selectedUser.user_id}`)}
                    >
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      @{selectedUser.first_name.toLowerCase()}{selectedUser.last_name.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMessageSearch(!showMessageSearch)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Container */}
              <MessagesContainer
                selectedUser={selectedUser}
                user={user}
                isTyping={false}
                formatTime={formatTime}
                searchTerm={showMessageSearch && messageSearchTerm ? messageSearchTerm : ''}
                showMessageSearch={showMessageSearch}
                messageSearchTerm={messageSearchTerm}
                setMessageSearchTerm={setMessageSearchTerm}
                onMessageSent={updateConversationWithNewMessage}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">Select a conversation</h2>
                <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minimized Chats - Only show on desktop */}
      {!isMobile && Array.from(minimizedChats).map((chatId) => {
        const chatConversation = conversations.find(c => c.participant?._id === chatId);
        if (!chatConversation?.participant || !isUserParticipant(chatConversation.participant)) return null;

        return (
          <MessagePopup
            key={chatId}
            user={{
              user_id: chatConversation.participant._id,
              first_name: chatConversation.participant.first_name,
              last_name: chatConversation.participant.last_name,
              profile_avatar: chatConversation.participant.profile_avatar,
              isOnline: false
            }}
            onClose={() => setMinimizedChats(prev => {
              const newSet = new Set(prev);
              newSet.delete(chatId);
              return newSet;
            })}
            onMinimize={() => {
              setMinimizedChats(prev => {
                const newSet = new Set(prev);
                newSet.delete(chatId);
                return newSet;
              });
            }}
            isMinimized={true}
          />
        );
      })}
    </div>
  );
}
