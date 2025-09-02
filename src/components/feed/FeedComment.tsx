import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Reply, ChevronDown, ChevronUp, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFeed } from '@/hooks/useFeed';

interface CommentUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_avatar?: string;
}

interface Reply {
  _id: string;
  content: string;
  created_at: string;
  user_id: CommentUser;
  parent_id: string;
  post_id: string;
  is_active: boolean;
}

interface Comment {
  _id: string;
  content: string;
  created_at: string;
  user_id: CommentUser;
  post_id: string;
  is_active: boolean;
}

interface FeedCommentProps {
  comment: Comment;
  currentUser?: any;
  postId: string;
  onDeleteComment: (commentId: string) => Promise<void>;
  onAddReply: (parentId: string, content: string) => Promise<void>;
}

export const FeedComment: React.FC<FeedCommentProps> = ({
  comment,
  currentUser,
  postId,
  onDeleteComment,
  onAddReply
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const { getCommentReplies } = useFeed();

  const { data: replies = [], refetch: refetchReplies } = getCommentReplies(comment._id);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMs = now.getTime() - commentDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      await onAddReply(comment._id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
      refetchReplies();
      toast.success('Reply added successfully!');
    } catch (error) {
      toast.error('Failed to add reply');
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getUserAvatar = (user: CommentUser) => {
    return user.profile_avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`;
  };

  const getUserName = (user: CommentUser) => {
    return `${user.first_name} ${user.last_name}`;
  };

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/20">
          <AvatarImage
            src={getUserAvatar(comment.user_id)}
            alt={getUserName(comment.user_id)}
            style={{ objectFit: 'cover' }}
          />
          <AvatarFallback className="text-xs font-medium">
            {comment.user_id.first_name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-card">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-foreground">
                  {getUserName(comment.user_id)}
                </p>
                <span className="text-xs text-muted-foreground">•</span>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(comment.created_at)}
                </p>
              </div>
              {currentUser && comment.user_id._id === currentUser._id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => onDeleteComment(comment._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center mt-2 ml-3 space-x-3">
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-muted-foreground h-6 px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-muted-foreground h-6 px-2"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide {replies.length}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {replies.length}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && currentUser && (
            <div className="mt-3 ml-3">
              <div className="flex space-x-3">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage
                    src={currentUser.profile_avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.first_name)}`}
                    alt={`${currentUser.first_name}`}
                    style={{ objectFit: 'cover' }}
                  />
                  <AvatarFallback className="text-xs">
                    {currentUser.first_name[0]}{currentUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder={`Reply to ${comment.user_id.first_name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[50px] text-xs resize-none border-border focus:border-primary"
                    disabled={isSubmittingReply}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText('');
                      }}
                      className="h-6 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim() || isSubmittingReply}
                      size="sm"
                      className="h-6 text-xs"
                    >
                      {isSubmittingReply ? (
                        <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white mr-1"></div>
                      ) : (
                        <Send className="h-2 w-2 mr-1" />
                      )}
                      {isSubmittingReply ? 'Replying...' : 'Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies with Curved Connector */}
          {showReplies && replies.length > 0 && (
            <div className="relative mt-3 ml-6">
              {/* Curved Connector */}
              <div className="absolute -left-6 top-0 bottom-0">
                <svg width="24" height="100%" className="text-border">
                  <path
                    d="M 0 0 Q 12 12 12 24 L 12 100%"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                    className="opacity-30"
                  />
                </svg>
              </div>

              <div className="space-y-3">
                {replies.map((reply: Reply, index) => (
                  <div key={reply._id} className="relative">
                    {/* Individual reply connector */}
                    <div className="absolute -left-6 top-4">
                      <div className="w-4 h-px bg-border opacity-30"></div>
                    </div>

                    <div className="flex space-x-3">
                      <Avatar className="h-6 w-6 flex-shrink-0 border border-primary/10">
                        <AvatarImage
                          src={getUserAvatar(reply.user_id)}
                          alt={getUserName(reply.user_id)}
                          style={{ objectFit: 'cover' }}
                        />
                        <AvatarFallback className="text-xs">
                          {reply.user_id.first_name[0]}{reply.user_id.last_name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-xs font-medium text-foreground">
                                {getUserName(reply.user_id)}
                              </p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(reply.created_at)}
                              </p>
                            </div>
                            {currentUser && reply.user_id._id === currentUser._id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                onClick={() => onDeleteComment(reply._id)}
                              >
                                <Trash2 className="h-2 w-2" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};