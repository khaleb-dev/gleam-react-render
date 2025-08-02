
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download, Edit3, Send } from 'lucide-react';
import { User } from '@/types';
import { ProfileCardGenerator } from './ProfileCardGenerator';
import { LinkupCount } from '@/components/feed/LinkupCount';
import { LinkupButton } from '@/components/feed/LinkupButton';
import { useLinkup } from '@/hooks/useLinkup';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  user: User | null;
  onEditClick: () => void;
  isOwnProfile?: boolean;
}

export const ProfileHeader = ({ user, onEditClick, isOwnProfile = false }: ProfileHeaderProps) => {
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const { loggedInUser } = useAuth();
  const navigate = useNavigate();
  
  // Check mutual linkup status
  const { status: linkupStatus } = useLinkup(user?._id || user?.user_id || '');

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Cover Photo Skeleton */}
        <div className="h-48 bg-gray-200 animate-pulse rounded-t-lg"></div>
        
        {/* Profile Section Skeleton */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="h-32 w-32 bg-gray-200 rounded-full animate-pulse border-4 border-white"></div>
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse mt-4"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 w-48 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 w-64 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 w-56 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const firstName = user.first_name || 'User';
  const lastName = user.last_name || '';
  const email = user.email || 'user@example.com';
  const phoneNumber = user.phone_number || '';

  // Generate Dicebear URLs
  const profileImageUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`;
  const coverImageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lastName || firstName)}&backgroundColor=2563eb,7c3aed,dc2626,ea580c,16a34a`;

  const handleDownloadProfileCard = async () => {
    setIsGeneratingCard(true);
    try {
      console.log('Generating profile card for:', { firstName, lastName, email });
      
      await ProfileCardGenerator.generateAndDownload({
        firstName,
        lastName,
        email,
        phoneNumber,
        jobPosition: user.role || '',
        profileImageUrl,
        coverImageUrl
      });
    } catch (error) {
      console.error('Failed to generate profile card:', error);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Cover Photo */}
      <div className="h-48 relative">
        <img 
          src={coverImageUrl}
          alt="Cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load cover image:', coverImageUrl);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Action Buttons - Only show for own profile */}
        {isOwnProfile && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Button
              onClick={handleDownloadProfileCard}
              disabled={isGeneratingCard}
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-800 text-xs shadow-md backdrop-blur-sm h-7 px-2 sm:h-9 sm:px-3"
            >
              <Download size={12} className="sm:mr-1" />
              <span className="hidden sm:inline ml-1">
                {isGeneratingCard ? 'Generating...' : 'Download Profile Card'}
              </span>
            </Button>
            <Button
              onClick={onEditClick}
              size="sm"
              className="bg-primary/90 hover:bg-primary text-white text-xs shadow-md backdrop-blur-sm h-7 px-2 sm:h-9 sm:px-3"
            >
              <Edit3 size={12} className="sm:mr-1" />
              <span className="hidden sm:inline ml-1">Edit Profile</span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Profile Section with mobile-specific padding */}
      <div className="px-1.5 py-1.5 sm:px-6 sm:pb-6 relative">
        {/* Profile Picture - Overlapping cover */}
        <div className="flex justify-between items-start -mt-12 sm:-mt-16 mb-4 sm:mb-6">
          <Avatar className="h-20 w-20 sm:h-32 sm:w-32 border-4 border-white shadow-lg">
            <AvatarImage 
              src={profileImageUrl}
              alt={firstName}
              className="object-cover"
              onError={(e) => {
                console.error('Failed to load profile image:', profileImageUrl);
              }}
            />
            <AvatarFallback className="bg-primary text-white text-lg sm:text-2xl">
              {firstName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="space-y-2 sm:space-y-3">
          {/* Name and linkup section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900">
                {firstName} {lastName}
              </h1>
              <LinkupCount userId={user._id || user.user_id} className="mt-1" />
            </div>
          </div>

          {/* Action buttons for other users' profiles */}
          {!isOwnProfile && (
            <div className="flex items-center gap-2 mb-3 h-9">
              {/* Only show message button if mutually linked */}
              {linkupStatus.isMutual && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/messages?userId=${user._id || user.user_id}`)}
                  className="flex items-center gap-1 bg-background hover:bg-accent border-border text-foreground h-9"
                >
                  <Send className="h-4 w-4 mr-2" />
                  <span className="text-xs">Message</span>
                </Button>
              )}
              <LinkupButton userId={user._id || user.user_id} />
            </div>
          )}
          
          {/* Contact Info */}
          <div className="space-y-1">
            <p className="text-gray-600 text-xs" style={{ fontSize: '11px' }}>{email}</p>
            {phoneNumber && (
              <p className="text-gray-600 text-xs" style={{ fontSize: '11px' }}>{phoneNumber}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
