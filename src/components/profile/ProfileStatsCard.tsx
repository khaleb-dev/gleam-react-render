import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Eye, FileText, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useLinkup } from '@/hooks/useLinkup';
import { LinkupFollowersModal } from './LinkupFollowersModal';
import type { User } from '@/types';

interface ProfileStatsCardProps {
  user?: User | null;
}

export const ProfileStatsCard = ({ user }: ProfileStatsCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'linkups' | 'followers'>('linkups');

  const { data: profileStats, isLoading: statsLoading } = useProfileStats(user?._id);
  const { counts } = useLinkup(user?._id || '');

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 mb-3"></div>
            <div className="p-4 -mt-8">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate Dicebear URLs
  const firstName = user.first_name || 'User';
  const lastName = user.last_name || '';
  const profileImageUrl = user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`;
  const coverImageUrl = user.cover_avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lastName || firstName)}&backgroundColor=2563eb,7c3aed,dc2626,ea580c,16a34a`;

  // Get current job from experience
  const currentJob = user.experience?.find((exp: any) => exp.is_current);

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {/* Cover Photo */}
        <div className="h-20 relative">
          <img
            src={coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lastName || firstName)}&backgroundColor=2563eb,7c3aed,dc2626,ea580c,16a34a`;
              console.log('Using default cover image');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="p-4 -mt-8">
          {/* Profile Section - Adjusted layout to make card taller */}
          <div className="flex items-start space-x-3 mb-6">
            <Avatar className="h-16 w-16 flex-shrink-0 border-4 border-white shadow-lg">
              <AvatarImage
                src={profileImageUrl}
                alt={firstName}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`;
                  console.log('Using default profile image');
                }}
              />
              <AvatarFallback className="bg-primary text-white text-sm">
                {firstName?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-8">
              <h3 className="font-semibold text-sm truncate mb-1">
                {firstName} {lastName}
              </h3>
              <p className="text-xs text-gray-500 truncate mb-1">{user.email}</p>
              {currentJob && (
                <p className="text-xs text-gray-600 truncate">
                  {currentJob.job_title} at {currentJob.company}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {user.location && (
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600">{user.location}</span>
            </div>
          )}

          {/* Stats */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Profile views</span>
              </div>
              {statsLoading ? (
                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="text-xs font-semibold">{profileStats?.data?.totalProfileViews || 0}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Total posts</span>
              </div>
              {statsLoading ? (
                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="text-xs font-semibold">{profileStats?.data?.totalPosts || 0}</span>
              )}
            </div>

            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-1 -m-1 transition-colors"
              onClick={() => {
                setModalInitialTab('linkups');
                setModalOpen(true);
              }}
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Linkups</span>
              </div>
              <span className="text-xs font-semibold">{counts.linkedUpCount || 0}</span>
            </div>

            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-1 -m-1 transition-colors"
              onClick={() => {
                setModalInitialTab('followers');
                setModalOpen(true);
              }}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Followers</span>
              </div>
              <span className="text-xs font-semibold">{counts.linkedMeCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {user && (
        <LinkupFollowersModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={user._id}
          initialTab={modalInitialTab}
        />
      )}
    </Card>
  );
};
