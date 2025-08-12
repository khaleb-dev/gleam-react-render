import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessagePopup } from '@/context/MessagePopupContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useLinkup } from '@/hooks/useLinkup';

interface MessageButtonProps {
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    profile_avatar?: string;
    isOnline?: boolean;
  };
  className?: string;
  showAsButton?: boolean;
}

export const MessageButton: React.FC<MessageButtonProps> = ({ 
  user, 
  className = "", 
  showAsButton = false 
}) => {
  const { openPopup } = useMessagePopup();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { status } = useLinkup(user.user_id);

  // Don't render anything if users are not mutually linked or still loading
  if (status.isLoading || !status.isMutual) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isMobile) {
      // For mobile, navigate to messages page with user info
      const searchParams = new URLSearchParams({
        firstName: user.first_name,
        lastName: user.last_name,
        ...(user.profile_avatar && { profileAvatar: user.profile_avatar })
      });
      navigate(`/messages/${user.user_id}?${searchParams.toString()}`);
    } else {
      // For desktop, open the popup
      openPopup(user);
    }
  };

  if (showAsButton) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors dark:bg-primary dark:text-primary-foreground ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        Message
      </button>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer hover:scale-105 transition-transform ${className}`}
    >
      <div className="relative">
        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
          <AvatarImage
            src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
            className="object-cover w-full h-full"
            alt={`${user.first_name} ${user.last_name}`}
          />
          <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {user.first_name[0]}{user.last_name[0]}
          </AvatarFallback>
        </Avatar>
        
        {/* Message icon overlay */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
          <MessageCircle className="h-3 w-3 text-white" />
        </div>
        
        {/* Online status indicator */}
        {user.isOnline && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
    </div>
  );
};
