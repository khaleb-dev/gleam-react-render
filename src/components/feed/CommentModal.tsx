import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react';
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

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  currentUser?: {
    profile_avatar: any;
    first_name: string;
    last_name: string;
    email: string;
    _id: string;
  };
}

const CommentItem: React.FC<{
  comment: Comment;
  currentUser?: any;
  postId: string;
  onDeleteComment: (commentId: string) => Promise<void>;
  onAddReply: (parentId: string, content: string) => Promise<void>;
}> = ({ comment, currentUser, postId, onDeleteComment, onAddReply }) => {
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
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/10">
          <AvatarImage
            src={getUserAvatar(comment.user_id)}
            alt={getUserName(comment.user_id)}
            style={{ objectFit: 'cover' }}
          />
          <AvatarFallback className="text-sm font-medium">
            {comment.user_id.first_name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-card p-4">
            <div className="flex items-center justify-between mb-2">
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
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
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
          <div className="flex items-center mt-2 ml-4 space-x-4">
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-muted-foreground h-7 px-2"
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
                className="text-xs text-muted-foreground h-7 px-2"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && currentUser && (
            <div className="mt-3 ml-4">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={currentUser.profile_avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.first_name)}`}
                    alt={`${currentUser.first_name} ${currentUser.last_name}`}
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
                    className="min-h-[60px] resize-none text-sm border-border focus:border-primary"
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
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim() || isSubmittingReply}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      {isSubmittingReply ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      ) : (
                        <Send className="h-3 w-3 mr-1" />
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
            <div className="relative mt-3 ml-8">
              {/* Curved Connector */}
              <div className="absolute -left-8 top-0 bottom-0">
                <svg width="32" height="100%" className="text-border">
                  <path
                    d="M 0 0 Q 16 16 16 32 L 16 100%"
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
                    <div className="absolute -left-8 top-4">
                      <div className="w-6 h-px bg-border opacity-30"></div>
                    </div>

                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/10">
                        <AvatarImage
                          src={getUserAvatar(reply.user_id)}
                          alt={getUserName(reply.user_id)}
                        />
                        <AvatarFallback className="text-xs">
                          {reply.user_id.first_name[0]}{reply.user_id.last_name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="p-3">
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
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                onClick={() => onDeleteComment(reply._id)}
                              >
                                <Trash2 className="h-2.5 w-2.5" />
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

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  postId,
  currentUser
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getPostComments, commentOnPost, deleteComment, addReply } = useFeed();

  // Fetch comments
  const { data: comments = [], isLoading, refetch } = getPostComments(postId);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await commentOnPost({ postId, payload: { content: newComment.trim() } });
      setNewComment('');
      toast.success('Comment added successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast.success('Comment deleted successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    try {
      await addReply({ postId, parentCommentId, payload: { content } });
      refetch();
    } catch (error) {
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 border-b border-border">
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            Comments
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-3">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">No comments yet</p>
                <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment: Comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUser={currentUser}
                  postId={postId}
                  onDeleteComment={handleDeleteComment}
                  onAddReply={handleAddReply}
                />
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {currentUser && (
            <div className="border-t border-border p-6">
              <div className="flex space-x-4">
                <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/10">
                  <AvatarImage
                    src={currentUser.profile_avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.first_name)}`}
                    alt={`${currentUser.first_name} ${currentUser.last_name}`}
                  />
                  <AvatarFallback className="text-sm font-medium">
                    {currentUser.first_name[0]}{currentUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none border-border focus:border-primary"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="px-6"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};