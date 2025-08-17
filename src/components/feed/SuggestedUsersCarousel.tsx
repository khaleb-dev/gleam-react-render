import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { LinkupButton } from './LinkupButton';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { ArrowRight } from 'lucide-react';

export const SuggestedUsersCarousel: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSuggestedUsers(10, 0);

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
    return first + last || 'U';
  };

  if (isLoading) {
    return (
      <Card className="mx-4 lg:mx-0">
        <CardHeader>
          <CardTitle className="text-sm">People you may know</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-40">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-2 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
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
    <Card className="mx-4 lg:mx-0 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">People you may know</CardTitle>
          <span
            onClick={handleViewMore}
            className="text-xs cursor-pointer flex items-center text-primary hover:underline"
          >
            See all
            <ArrowRight className="h-3 w-3 ml-1" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {data.data.map((user) => (
              <CarouselItem key={user._id} className="pl-2 md:pl-4 basis-auto">
                <div className="w-40 p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <Avatar
                      className="h-12 w-12 cursor-pointer mx-auto mb-3"
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

                    <h4
                      className="font-medium text-sm truncate cursor-pointer hover:underline mb-1"
                      onClick={() => handleUserClick(user.user_id)}
                    >
                      {user.first_name || 'Unknown'} {user.last_name || 'User'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {user.is_vetted && user.responder_id?.job_title
                        ? user.responder_id.job_title
                        : 'Community Member'}
                    </p>
                    {user.responder_id?.rank_status && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full mb-2 inline-block"
                        style={{
                          backgroundColor: user.responder_id.rank_status.rank_color + '20',
                          color: user.responder_id.rank_status.rank_color
                        }}
                      >
                        {user.responder_id.rank_status.rank_name}
                      </span>
                    )}

                    <LinkupButton userId={user.user_id} className="text-xs w-full" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
};