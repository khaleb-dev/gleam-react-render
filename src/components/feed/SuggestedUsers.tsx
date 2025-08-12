import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LinkupButton } from './LinkupButton';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { ArrowRight } from 'lucide-react';

export const SuggestedUsers: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSuggestedUsers(7, 0); // Show only 7 on feed

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewMore = () => {
    navigate('/suggested-users');
  };

  // Helper function to safely get user initials
  const getUserInitials = (firstName: string | undefined, lastName: string | undefined) => {
    const first = (firstName && firstName.length > 0) ? firstName[0].toUpperCase() : '';
    const last = (lastName && lastName.length > 0) ? lastName[0].toUpperCase() : '';
    return first + last || 'U'; // Fallback to 'U' for User if no initials available
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Suggested for you</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success || !data?.data || data.data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Suggested for you</CardTitle>
          <span
            onClick={handleViewMore}
            className="text-xs cursor-pointer flex"
          >
            View More
            <ArrowRight className="h-3 w-3 ml-1" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.data.map((user) => (
            <div key={user._id} className="flex items-center space-x-3">
              <Avatar
                className="h-10 w-10 cursor-pointer"
                onClick={() => handleUserClick(user.user_id)}
              >
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name || 'user')}`}
                  alt={`${user.first_name || ''} ${user.last_name || ''}`}
                />
                <AvatarFallback className="text-xs">
                  {getUserInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h4
                  className="font-medium text-sm truncate cursor-pointer hover:underline"
                  onClick={() => handleUserClick(user.user_id)}
                >
                  {user.first_name || 'Unknown'} {user.last_name || 'User'}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {user.is_vetted && user.responder_id?.job_title
                    ? user.responder_id.job_title
                    : 'Community Member'}
                </p>
                {user.responder_id?.rank_status && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: user.responder_id.rank_status.rank_color + '20',
                      color: user.responder_id.rank_status.rank_color
                    }}
                  >
                    {user.responder_id.rank_status.rank_name}
                  </span>
                )}
              </div>

              <LinkupButton userId={user.user_id} className="text-xs" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
