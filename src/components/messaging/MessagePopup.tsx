import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, MessageCircle, Phone, Video, Smile, Image } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { ChatMessageText } from '@/components/chat/ChatMessageText';
import { LinkPreview } from '@/components/chat/LinkPreview';
import { findFirstUrl } from '@/components/chat/findFirstUrl';
import { messageApi, MessageData } from '@/services/messageApi';
import { toast } from 'sonner';
import { handleApiErrors } from '@/utils/apiResponse';
import { EmojiPicker } from '@/components/chat/EmojiPicker';
import { FilePreview } from '@/components/chat/FilePreview';
import { useFileUpload } from '@/hooks/useFileUpload';
import { isSingleEmoji } from '@/utils/emojiUtils';
import { ImagePreviewModal } from '@/components/chat/ImagePreviewModal';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { MessageStatus } from './MessageStatus';
import { MessageActions } from './MessageActions';
import { RepliedMessage } from './RepliedMessage';

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

export const MessagePopup: React.FC<MessagePopupProps> = ({
  user,
  onClose,
  onMinimize,
  isMinimized
}) => {
  const { user: currentUser } = useAppContext();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<MessageData | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, isUploading } = useFileUpload();

  // Fetch conversation on component mount
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await messageApi.getConversation(user.user_id);
        if (response.success && response.data) {
          setMessages(response.data);
        } else {
          handleApiErrors(response);
        }
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
        toast.error('Failed to load messages');
      }
    };

    fetchConversation();
  }, [user.user_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !currentUser) return;

    setIsSending(true);
    const tempMessage = newMessage.trim();
    const filesToUpload = [...selectedFiles];
    const replyTo = replyToMessage?._id;

    // Separate files by type
    const imageFiles = filesToUpload.filter(file => file.type.startsWith('image/'));
    const videoFiles = filesToUpload.filter(file => file.type.startsWith('video/'));

    // Create optimistic message with proper image_urls and video_urls
    const optimisticMessage: MessageData = {
      _id: `temp-${Date.now()}`,
      content: tempMessage,
      sender_id: currentUser.user_id,
      recipient_id: user.user_id,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: false,
      status: 'sending',
      image_urls: imageFiles.map(file => URL.createObjectURL(file)),
      video_urls: videoFiles.map(file => URL.createObjectURL(file)),
      reply_to: replyTo || undefined
    };

    // Show message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSelectedFiles([]);
    setReplyToMessage(null); // Clear reply context

    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      // Upload files if any
      if (filesToUpload.length > 0) {
        const uploadedUrls = await uploadFiles(filesToUpload);
        if (uploadedUrls) {
          // Separate uploaded URLs by original file type
          imageUrls = uploadedUrls.slice(0, imageFiles.length);
          videoUrls = uploadedUrls.slice(imageFiles.length);
        }
      }

      // Send message with content and/or media
      const response = await messageApi.sendMessage({
        recipient_id: user.user_id,
        content: tempMessage,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        video_urls: videoUrls.length > 0 ? videoUrls : undefined,
        reply_to: replyTo
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
            msg._id === optimisticMessage._id ? { ...response.data, status: 'sent' } : msg
          )
        );
      } else {
        // Mark message as failed instead of removing
        setMessages(prev =>
          prev.map(msg =>
            msg._id === optimisticMessage._id ? { ...msg, status: 'failed' } : msg
          )
        );
        handleApiErrors(response);
      }
    } catch (error) {
      // Clean up blob URLs and remove optimistic message on failure
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

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReply = (message: MessageData) => {
    setReplyToMessage(message);
  };

  const handleDeleteMessage = async (messageId: string) => {
    // Check if message is older than 1 day
    const message = messages.find(msg => msg._id === messageId);
    if (message) {
      const messageDate = new Date(message.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      if (messageDate < oneDayAgo) {
        toast.error('Cannot delete messages older than 24 hours');
        return;
      }
    }

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

  const handleImageClick = (images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setShowImageModal(true);
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
        reply_to: typeof failedMessage.reply_to === 'string' ? failedMessage.reply_to : failedMessage.reply_to?._id
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
      <div
        className="w-64 bg-background border border-border rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                className="object-cover"
              />
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{user.first_name} {user.last_name}</p>
              {/* <p className="text-xs text-muted-foreground">{user.isOnline ? 'Online' : 'Offline'}</p> */}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 h-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-80 h-96 bg-background border border-border rounded-lg shadow-xl flex flex-col text-foreground"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border rounded-tl-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                className="object-cover"
              />
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-muted-foreground">@{user.first_name.toLowerCase()}{user.last_name.toLowerCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onMinimize} className="p-1 h-auto text-muted-foreground hover:text-foreground">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => {
          const isOwn = message.sender_id.user_id === currentUser?.user_id || message.sender_id === currentUser.user_id;
          const url = findFirstUrl(message.content);
          const isEmojiOnly = isSingleEmoji(message.content);
          const repliedMessage = getRepliedMessage(message.reply_to);
          
          // Check if message can be deleted (less than 1 day old)
          const messageDate = new Date(message.timestamp);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const canDelete = messageDate >= oneDayAgo;

          return (
            <div key={message._id} className="space-y-1">
              {/* Replied Message Context */}
              {repliedMessage && (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                  {!isOwn && <div className="w-8" />}
                  <div className="max-w-[70%]">
                    <RepliedMessage repliedMessage={repliedMessage} isOwn={isOwn} />
                  </div>
                </div>
              )}
              {/* Media Content (Images/Videos) or Text-only Messages */}
              {(message.image_urls && message.image_urls.length > 0) || (message.video_urls && message.video_urls.length > 0) ? (
                // Messages with media (images or videos)
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                  {!isOwn && (
                    <Avatar className="h-6 w-6 mr-2 mt-1">
                      <AvatarImage
                        src={message.sender_id.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(message.sender_id.first_name || 'User')}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {message.sender_id.first_name?.[0] || 'U'}{message.sender_id.last_name?.[0] || 'N'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="max-w-[200px] space-y-1">
                    {/* Images */}
                    {message.image_urls && message.image_urls.length > 0 && (
                      <>
                        {message.image_urls.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt="Shared image"
                            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(message.image_urls!, index)}
                          />
                        ))}
                      </>
                    )}
                    
                    {/* Videos */}
                    {message.video_urls && message.video_urls.length > 0 && (
                      <>
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
                      </>
                    )}
                    
                    {/* Text content below media - fixed background styling */}
                    {message.content && message.content.trim() && (
                      <div className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-full ${isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                        }`}>
                        <ChatMessageText text={message.content} isOwn={isOwn} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Text-only messages (no media)
                message.content && message.content.trim() && (
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                      <Avatar className="h-6 w-6 mr-2 mt-1">
                        <AvatarImage
                          src={message.sender_id.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(message.sender_id.first_name || 'User')}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {message.sender_id.first_name?.[0] || 'U'}{message.sender_id.last_name?.[0] || 'N'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`${isEmojiOnly ? 'bg-transparent px-0 py-0' : `max-w-[70%] px-3 py-2 rounded-2xl ${isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                      }`} ${isEmojiOnly ? 'text-2xl' : 'text-sm'}`}>
                      {isEmojiOnly ? (
                        <span className="text-2xl">{message.content}</span>
                      ) : (
                        <ChatMessageText text={message.content} isOwn={isOwn} />
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Link Preview */}
              {url && (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && <div className="w-8" />}
                  <div className="max-w-[70%]">
                    <LinkPreview url={url} compact />
                  </div>
                </div>
              )}

              {/* Action buttons for messages */}
              {(message.content || message.image_urls?.length || message.video_urls?.length) && !isEmojiOnly && (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && <div className="w-8" />}
                  <div className="flex items-center gap-1">
                    <MessageActions
                      isOwn={isOwn}
                      onReply={() => handleReply(message)}
                      onDelete={canDelete ? () => handleDeleteMessage(message._id) : undefined}
                      className={isOwn ? 'order-first' : ''}
                    />
                  </div>
                </div>
              )}

              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-center gap-1 ${isOwn ? 'mr-2' : 'ml-8'}`}>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </p>
                  <MessageStatus 
                    message={message} 
                    isOwn={isOwn}
                    currentUserId={user?.user_id}
                    onRetry={() => handleRetryMessage(message)}
                  />
                </div>
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
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted p-2 rounded-2xl">
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

      {/* Reply Context */}
      {replyToMessage && (
        <div className="px-3 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
              Replying to {replyToMessage.sender_id?.first_name || 'Unknown'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToMessage(null)}
              className="p-1 h-auto text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 border-t border-border">
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
            >
              <Image className="h-3 w-3" />
            </Button>
            <div className="flex-shrink-0">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Start a new message"
              className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground focus:ring-0 h-auto p-0 text-sm"
            />
            <Button
              type="submit"
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending || isUploading}
              variant="ghost"
              size="sm"
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
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
      {showImageModal && selectedImages.length > 0 && (
        <ImagePreviewModal
          images={selectedImages}
          startIndex={selectedImageIndex}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};
