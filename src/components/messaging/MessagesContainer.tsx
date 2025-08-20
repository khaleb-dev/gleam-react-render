import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessageText } from '@/components/chat/ChatMessageText';
import { LinkPreview } from '@/components/chat/LinkPreview';
import { findFirstUrl } from '@/components/chat/findFirstUrl';
import { MessageData, messageApi } from '@/services/messageApi';
import { Send, Smile, Image, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from '@/components/chat/EmojiPicker';
import { FilePreview } from '@/components/chat/FilePreview';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { MessageActions } from './MessageActions';
import { ReplyContext } from './ReplyContext';
import { RepliedMessage } from './RepliedMessage';
import { isSingleEmoji } from '@/utils/emojiUtils';
import { ImagePreviewModal } from '@/components/chat/ImagePreviewModal';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { MessageStatus } from './MessageStatus';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

interface MessagesContainerProps {
  selectedUser: any;
  user: any;
  isTyping: boolean;
  formatTime: (timestamp: string) => string;
  searchTerm?: string;
  showMessageSearch?: boolean;
  messageSearchTerm?: string;
  setMessageSearchTerm?: (term: string) => void;
  onMessageSent?: (recipientId: string, message: string) => void;
}

const HighlightedText: React.FC<{ text: string; searchTerm: string }> = ({ text, searchTerm }) => {
  if (!searchTerm) return <span>{text}</span>;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-yellow-300 text-black px-1 rounded">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

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

// Format date for dividers
const formatDateDivider = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

export const MessagesContainer: React.FC<MessagesContainerProps> = ({
  selectedUser,
  user,
  isTyping,
  formatTime,
  searchTerm = '',
  showMessageSearch = false,
  messageSearchTerm = '',
  setMessageSearchTerm,
  onMessageSent
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const highlightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState<MessageData | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { uploadFiles, isUploading } = useFileUpload();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch messages when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const response = await messageApi.getConversation(selectedUser.user_id);
        if (response.success && response.data) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // Auto scroll when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Calculate total matches and scroll to highlighted message
  useEffect(() => {
    if (!searchTerm) {
      setTotalMatches(0);
      setCurrentHighlight(0);
      highlightRefs.current = [];
      return;
    }

    const matchingMessages = messages.filter(message =>
      message.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setTotalMatches(matchingMessages.length);
    setCurrentHighlight(matchingMessages.length > 0 ? 1 : 0);

    // Reset highlight refs array
    highlightRefs.current = new Array(matchingMessages.length).fill(null);

    // Scroll to first match after a short delay to ensure refs are set
    setTimeout(() => {
      if (matchingMessages.length > 0 && highlightRefs.current[0]) {
        highlightRefs.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [searchTerm, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !user || isSending) return;

    setIsSending(true);
    const tempMessage = newMessage.trim();
    const filesToUpload = [...selectedFiles];
    const replyTo = replyToMessage?._id;

    // Separate files by type
    const imageFiles = filesToUpload.filter(file => file.type.startsWith('image/'));
    const videoFiles = filesToUpload.filter(file => file.type.startsWith('video/'));

    // Create optimistic message - ensure it's marked as user's message
    const optimisticMessage: MessageData = {
      _id: `temp-${Date.now()}`,
      content: tempMessage,
      sender_id: user.user_id,
      recipient_id: selectedUser.user_id,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: false,
      status: 'sending',
      image_urls: imageFiles.map(file => URL.createObjectURL(file)),
      video_urls: videoFiles.map(file => URL.createObjectURL(file)),
      reply_to: replyTo || undefined
    };

    // Add message immediately to UI
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSelectedFiles([]);
    setReplyToMessage(null); // Clear reply context

    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      if (filesToUpload.length > 0) {
        const uploadedUrls = await uploadFiles(filesToUpload);
        if (uploadedUrls) {
          // Separate uploaded URLs by original file type
          imageUrls = uploadedUrls.slice(0, imageFiles.length);
          videoUrls = uploadedUrls.slice(imageFiles.length);
        }
      }

      const response = await messageApi.sendMessage({
        recipient_id: selectedUser.user_id,
        content: tempMessage,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        video_urls: videoUrls.length > 0 ? videoUrls : undefined,
        reply_to: replyTo,
        chat_type: selectedUser.isPage ? 'page_channel' : 'private'
      });

      if (response.success && response.data) {
        // Clean up blob URLs
        optimisticMessage.image_urls?.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        optimisticMessage.video_urls?.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });

        // Replace optimistic message with real one and update status
        setMessages(prev =>
          prev.map(msg =>
            msg._id === optimisticMessage._id ? {
              ...response.data,
              status: response.data?.isRead ? 'read' : 'sent'
            } : msg
          )
        );

        // Notify parent component about new message for inbox update
        if (onMessageSent && tempMessage) {
          onMessageSent(selectedUser.user_id, tempMessage);
        }
      } else {
        // Mark message as failed instead of removing
        setMessages(prev =>
          prev.map(msg =>
            msg._id === optimisticMessage._id ? { ...msg, status: 'failed' } : msg
          )
        );
        toast.error('Failed to send message');
      }
    } catch (error) {
      // Mark message as failed instead of removing
      setMessages(prev =>
        prev.map(msg =>
          msg._id === optimisticMessage._id ? { ...msg, status: 'failed' } : msg
        )
      );
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = (message: MessageData) => {
    setReplyToMessage(message);
  };

  const handleDeleteMessage = async (messageId: string) => {
    // Optimistically remove the message
    const originalMessages = [...messages];
    setMessages(prev => prev.filter(msg => msg._id !== messageId));

    try {
      const response = await messageApi.deleteMessage(messageId);
      if (response.success) {
        toast.success('Message deleted');
      } else {
        // Revert on failure
        setMessages(originalMessages);
        toast.error('Failed to delete message');
      }
    } catch (error) {
      // Revert on failure
      setMessages(originalMessages);
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getRepliedMessage = (replyTo: MessageData | string | undefined): MessageData | undefined => {
    if (!replyTo) return undefined;

    // If reply_to is already a full message object, return it
    if (typeof replyTo === 'object' && '_id' in replyTo) {
      return replyTo;
    }

    // If reply_to is just an ID string, find it in messages
    if (typeof replyTo === 'string') {
      return messages.find(msg => msg._id === replyTo);
    }

    return undefined;
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = (images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const navigateHighlight = (direction: 'up' | 'down') => {
    if (totalMatches === 0) return;

    let newIndex: number;
    if (direction === 'up') {
      newIndex = currentHighlight > 1 ? currentHighlight - 1 : totalMatches;
    } else {
      newIndex = currentHighlight < totalMatches ? currentHighlight + 1 : 1;
    }

    setCurrentHighlight(newIndex);

    // Scroll to the highlighted message
    const highlightElement = highlightRefs.current[newIndex - 1];
    if (highlightElement) {
      highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleRetryMessage = async (failedMessage: MessageData) => {
    // Mark message as sending again
    setMessages(prev =>
      prev.map(msg =>
        msg._id === failedMessage._id ? { ...msg, status: 'sending' } : msg
      )
    );

    try {
      const response = await messageApi.sendMessage({
        recipient_id: failedMessage.recipient_id,
        content: failedMessage.content,
        image_urls: failedMessage.image_urls,
        video_urls: failedMessage.video_urls,
        reply_to: typeof failedMessage.reply_to === 'string' ? failedMessage.reply_to : failedMessage.reply_to?._id,
        chat_type: selectedUser.isPage ? 'page_channel' : 'private'
      });

      if (response.success && response.data) {
        // Replace failed message with successful one
        setMessages(prev =>
          prev.map(msg =>
            msg._id === failedMessage._id ? {
              ...response.data,
              status: response.data?.isRead ? 'read' : 'sent'
            } : msg
          )
        );

        // Notify parent component about new message for inbox update
        if (onMessageSent && failedMessage.content) {
          onMessageSent(failedMessage.recipient_id, failedMessage.content);
        }
      } else {
        // Mark as failed again
        setMessages(prev =>
          prev.map(msg =>
            msg._id === failedMessage._id ? { ...msg, status: 'failed' } : msg
          )
        );
        toast.error('Failed to resend message');
      }
    } catch (error) {
      // Mark as failed again
      setMessages(prev =>
        prev.map(msg =>
          msg._id === failedMessage._id ? { ...msg, status: 'failed' } : msg
        )
      );
      console.error('Failed to resend message:', error);
      toast.error('Failed to resend message');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Message Search Bar - Compact */}
      {showMessageSearch && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={messageSearchTerm}
                onChange={(e) => setMessageSearchTerm?.(e.target.value)}
                className="pl-10 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {totalMatches > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {currentHighlight} of {totalMatches}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateHighlight('up')}
                  className="p-1 h-7 w-7"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateHighlight('down')}
                  className="p-1 h-7 w-7"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area - Scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-background"
      >
        {messages.map((message, messageIndex) => {
          const isOwn = message.sender_id.user_id === user?.user_id || message.sender_id === user?.user_id;
          const url = findFirstUrl(message.content);
          const repliedMessage = getRepliedMessage(message.reply_to);
          const isEmojiOnly = isSingleEmoji(message.content);

          // Check if this message matches the search
          const matchesSearch = searchTerm &&
            message.content?.toLowerCase().includes(searchTerm.toLowerCase());

          // Get the index of this message among all matching messages
          let matchIndex = -1;
          if (matchesSearch) {
            const allMatchingMessages = messages.filter(msg =>
              msg.content?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            matchIndex = allMatchingMessages.findIndex(msg => msg._id === message._id);
          }

          // Check if this is the currently highlighted match
          const isCurrentMatch = matchesSearch && matchIndex === currentHighlight - 1;

          // Remove avatars from private messages completely
          const showAvatar = false;
          // For page channels, indent message bubble under the sender name (not the avatar)
          const indentLeft = !isOwn && selectedUser.isPage;

          // Check if we need to show a date divider
          const currentMessageDate = new Date(message.createdAt);
          const prevMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
          const showDateDivider = !prevMessage || !isSameDay(currentMessageDate, new Date(prevMessage.createdAt));

          return (
            <React.Fragment key={message._id}>
              {/* Date Divider */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-6">
                  <div className="flex-1 h-px bg-border"></div>
                  <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full mx-4">
                    {formatDateDivider(currentMessageDate)}
                  </div>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
              )}

              {/* Message Container with spacing */}
              <div className="mb-6">
                <div
                  ref={matchesSearch ? (el) => { highlightRefs.current[matchIndex] = el; } : undefined}
                  className={`group ${isCurrentMatch ? 'bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-2' : ''}`}
                >
                  {/* Replied Message Context */}
                  {repliedMessage && (
                    <div className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && <div className="w-11" />}
                      <div className="max-w-xs">
                        <RepliedMessage repliedMessage={repliedMessage} isOwn={isOwn} />
                      </div>
                    </div>
                  )}

                  {/* Sender info for page_channel messages only */}
                  {selectedUser.isPage && !isOwn && (
                    <div className="flex items-start gap-2 mb-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={`https://robohash.org/${encodeURIComponent(message.sender_id.first_name || 'user')}?set=set4&size=200x200`}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="bg-secondary text-xs">
                          {(message.sender_id.first_name || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className={`text-xs font-medium ${getSenderColor(message.sender_id._id || message.sender_id.user_id)}`}>
                          ~{`${message.sender_id.first_name || ''} ${message.sender_id.last_name || ''}`.trim() || 'Unknown User'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  {(message.content && message.content.trim()) && (!message.image_urls || message.image_urls.length === 0) && (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {/* Left spacer so bubble sits under the name when page channel */}
                      {indentLeft && <div className="w-11" />}
                      {/* Avatar for private messages only - single avatar */}
                      {!isOwn && showAvatar && (
                        <Avatar className="h-8 w-8 mr-3 mt-1 flex-shrink-0">
                          <AvatarImage
                            src={selectedUser.profile_picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUser.name || 'User')}`}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                            {selectedUser.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="relative flex items-center gap-2">
                        <div className={`relative ${isEmojiOnly ? 'bg-transparent px-0 py-0' : `max-w-xs px-4 py-2 ${isOwn
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                          : 'bg-muted text-foreground rounded-2xl rounded-bl-md'
                          }`} ${isEmojiOnly ? 'text-4xl' : 'text-sm'}`}>

                          {/* Speech bubble pointer for private messages */}
                          {!isOwn && !selectedUser.isPage && !isEmojiOnly && (
                            <div className="absolute left-0 top-4 -translate-x-1 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-muted border-b-[8px] border-b-transparent"></div>
                          )}
                          {isOwn && !isEmojiOnly && (
                            <div className="absolute right-0 top-4 translate-x-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-primary border-b-[8px] border-b-transparent"></div>
                          )}

                          {searchTerm ? (
                            <HighlightedText text={message.content} searchTerm={searchTerm} />
                          ) : (
                            isEmojiOnly ? (
                              <span className="text-4xl">{message.content}</span>
                            ) : (
                              <ChatMessageText text={message.content} isOwn={isOwn} />
                            )
                          )}
                        </div>
                        <MessageActions
                          isOwn={isOwn}
                          onReply={() => handleReply(message)}
                          onDelete={isOwn ? () => handleDeleteMessage(message._id) : undefined}
                          className={isOwn ? 'order-first' : ''}
                        />
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {message.image_urls && message.image_urls.length > 0 && (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && <div className="w-11" />}
                      <div className="relative flex items-center gap-2">
                        <div className="max-w-xs space-y-1">
                          {message.image_urls.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt="Shared image"
                              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => handleImageClick(message.image_urls!, index)}
                            />
                          ))}
                          {message.content && message.content.trim() && (
                            <div className={`inline-block px-4 py-2 rounded-2xl text-sm max-w-full ${isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                              }`}>
                              {searchTerm ? (
                                <HighlightedText text={message.content} searchTerm={searchTerm} />
                              ) : (
                                <ChatMessageText text={message.content} isOwn={isOwn} />
                              )}
                            </div>
                          )}
                        </div>
                        <MessageActions
                          isOwn={isOwn}
                          onReply={() => handleReply(message)}
                          onDelete={isOwn ? () => handleDeleteMessage(message._id) : undefined}
                          className={isOwn ? 'order-first' : ''}
                        />
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {message.video_urls && message.video_urls.length > 0 && (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && <div className="w-11" />}
                      <div className="relative flex items-center gap-2">
                        <div className="max-w-xs space-y-1">
                          {message.video_urls.map((videoUrl, index) => (
                            <VideoPlayer
                              key={index}
                              src={videoUrl}
                              className="rounded-lg max-w-full"
                              enableScrollAutoPlay={false}
                              enablePictureInPicture={false}
                              showMinimalControls={true}
                            />
                          ))}
                          {message.content && message.content.trim() && (
                            <div className={`inline-block px-4 py-2 rounded-2xl text-sm max-w-full ${isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                              }`}>
                              {searchTerm ? (
                                <HighlightedText text={message.content} searchTerm={searchTerm} />
                              ) : (
                                <ChatMessageText text={message.content} isOwn={isOwn} />
                              )}
                            </div>
                          )}
                        </div>
                        <MessageActions
                          isOwn={isOwn}
                          onReply={() => handleReply(message)}
                          onDelete={isOwn ? () => handleDeleteMessage(message._id) : undefined}
                          className={isOwn ? 'order-first' : ''}
                        />
                      </div>
                    </div>
                  )}

                  {/* Link Preview */}
                  {url && (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && <div className="w-11" />}
                      <div className="max-w-xs">
                        <LinkPreview url={url} compact />
                      </div>
                    </div>
                  )}

                  {/* Timestamp with more spacing */}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mt-3`}>
                    <div className={`flex items-center gap-1 ${isOwn ? 'mr-3' : (indentLeft ? 'ml-11' : '')}`}>
                      <p className="text-xs text-muted-foreground text-left">
                        {formatTime(message.timestamp)}
                      </p>
                      <MessageStatus
                        message={message}
                        isOwn={isOwn}
                        currentUserId={user?._id}
                        onRetry={() => handleRetryMessage(message)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage
                src={selectedUser.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUser.first_name)}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                {selectedUser.first_name?.[0] || 'U'}{selectedUser.last_name?.[0] || 'N'}
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-background">
        {/* Reply Context */}
        {replyToMessage && (
          <ReplyContext
            replyToMessage={replyToMessage}
            onCancel={() => setReplyToMessage(null)}
          />
        )}

        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3">
            <FilePreview files={selectedFiles} onRemoveFile={handleRemoveFile} />
          </div>
        )}

        <form onSubmit={handleSendMessage}>
          <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileSelect}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="Attach image or video"
            >
              <Image className="h-4 w-4" />
            </Button>
            <div className="flex-shrink-0">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground focus:ring-0 h-auto p-0 text-sm"
            />
            <Button
              type="submit"
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending || isUploading}
              variant="ghost"
              size="sm"
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <ImagePreviewModal
          images={selectedImages}
          startIndex={selectedImageIndex}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};
