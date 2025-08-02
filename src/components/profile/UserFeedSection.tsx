import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Calendar } from 'lucide-react';
import { useUserFeed } from '@/hooks/useUserFeed';
import { useNavigate } from 'react-router-dom';

interface UserFeedSectionProps {
  userId: string;
  userName: string;
}

export const UserFeedSection: React.FC<UserFeedSectionProps> = ({ userId, userName }) => {
  const { data, isLoading, error } = useUserFeed(userId, 3);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success || !data?.data || data.data.length === 0) {
    return (
      <Card className="shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No posts yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();
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
    <Card className="shadow-sm border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Posts by {userName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.data.map((post) => (
            <div
              key={post._id}
              className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors group"
              onClick={() => navigate(`/feed/${post._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`}
                      alt={userName}
                    />
                    <AvatarFallback className="text-xs">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-card-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              </div>

              <h3 className="font-semibold text-base text-card-foreground mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>

              {post.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {post.description}
                </p>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{post.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>{post.total_score} scores</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{post.comments_count} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
