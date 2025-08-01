import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessagePopup } from './MessagePopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface MessageButtonProps {
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    profile_avatar?: string;
    isOnline?: boolean;
  };
  className?: string;
}

export const MessageButton: React.FC<MessageButtonProps> = ({ user, className = "" }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isMobile) {
      navigate(`/messages/${user.user_id}`);
    } else {
      setShowPopup(true);
      setIsMinimized(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsMinimized(false);
  };

  const handleMinimizePopup = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`cursor-pointer hover:scale-105 transition-transform ${className}`}
      >
        <div className="relative">
          <Avatar className="h-10 w-10 border-2 border-white shadow-md">
            <AvatarImage
              src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
              className="object-cover"
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

      {/* Desktop Popup */}
      {!isMobile && showPopup && (
        <MessagePopup
          user={user}
          onClose={handleClosePopup}
          onMinimize={handleMinimizePopup}
          isMinimized={isMinimized}
        />
      )}
    </>
  );
};