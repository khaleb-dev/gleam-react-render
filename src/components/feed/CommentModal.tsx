import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFeed } from '@/hooks/useFeed';

interface Comment {
  _id: string;
  // user_id: string;
  content: string;
  created_at: string;
  user_id: {
    [x: string]: any;
    first_name: string;
    last_name: string;
    email: string;
    _id: string
  };
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

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  postId,
  currentUser
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getPostComments, commentOnPost, deleteComment } = useFeed();

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Comments
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-4 max-h-60">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={
                        comment.user_id.profile_avatar ? comment.user_id.profile_avatar :
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comment.user_id.first_name)}`
                      }
                      alt={comment.user_id ?
                        `${comment.user_id.first_name} ${comment.user_id.last_name}`
                        : 'user'
                      }
                    />
                    <AvatarFallback className="text-xs">
                      {comment.user_id ?
                        `${comment.user_id.first_name[0]}${comment.user_id.last_name[0]}`
                        : 'User'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-foreground">
                          {comment.user_id ?
                            `${comment.user_id.first_name} ${comment.user_id.last_name}`
                            : 'Anonymous User'
                          }
                        </p>
                        {currentUser && comment.user_id?._id === currentUser._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-foreground">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-3">
                      {formatTimeAgo(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {currentUser && (
            <div className="border-t p-4 mt-4">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={currentUser.profile_avatar ? currentUser.profile_avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.first_name)}`}
                    alt={`${currentUser.first_name} ${currentUser.last_name}`}
                  />
                  <AvatarFallback className="text-xs">
                    {currentUser.first_name[0]}{currentUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      size="sm"
                      className="h-8"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      ) : (
                        <Send className="h-3 w-3 mr-1" />
                      )}
                      {isSubmitting ? 'Posting...' : 'Post'}
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
