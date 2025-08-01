import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LinkupButton } from './LinkupButton';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { ArrowRight, Users } from 'lucide-react';

export const MobileSuggestedUsers: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSuggestedUsers(3, 0); // Show only 3 on mobile

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewMore = () => {
    navigate('/suggested-users');
  };

  if (isLoading) {
    return (
      <Card className="mx-4 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suggested for you
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 text-center">
                <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-1 w-16"></div>
                <div className="h-2 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
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
    <Card className="mx-4 mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suggested for you
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMore}
            className="text-xs h-auto p-1"
          >
            View More
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {data.data.map((user) => (
            <div key={user._id} className="flex-shrink-0 text-center w-20">
              <Avatar
                className="h-16 w-16 cursor-pointer mx-auto mb-2"
                onClick={() => handleUserClick(user.user_id)}
              >
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                  alt={`${user.first_name} ${user.last_name}`}
                />
                <AvatarFallback className="text-xs">
                  {user.first_name[0]}{user.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <h4
                className="font-medium text-xs truncate cursor-pointer hover:underline mb-1"
                onClick={() => handleUserClick(user.user_id)}
              >
                {user.first_name} {user.last_name}
              </h4>
              
              <p className="text-xs text-muted-foreground truncate mb-2">
                {user.is_vetted && user.responder_id?.job_title
                  ? user.responder_id.job_title
                  : 'Member'}
              </p>

              <LinkupButton userId={user.user_id} className="text-xs w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
