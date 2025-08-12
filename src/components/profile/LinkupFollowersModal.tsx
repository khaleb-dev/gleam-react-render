import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config/env';
import { LinkupButton } from '@/components/feed/LinkupButton';
import { useNavigate } from 'react-router-dom';

interface UserData {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_avatar?: string;
  followersCount: number;
  linkupsCount: number;
}

interface LinkupFollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: 'linkups' | 'followers';
}

export const LinkupFollowersModal: React.FC<LinkupFollowersModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialTab = 'linkups'
}) => {
  const [linkups, setLinkups] = useState<UserData[]>([]);
  const [followers, setFollowers] = useState<UserData[]>([]);
  const [loadingLinkups, setLoadingLinkups] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchLinkups();
      fetchFollowers();
    }
  }, [isOpen, userId]);

  const fetchLinkups = async () => {
    setLoadingLinkups(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/all-linkups/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log('Modal linkups API response for userId:', userId, data);
      if (data.success) {
        setLinkups(data.data.users || []);
        console.log('Setting linkups in modal:', data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching linkups:', error);
    } finally {
      setLoadingLinkups(false);
    }
  };

  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/all-followers/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log('Modal followers API response for userId:', userId, data);
      if (data.success) {
        setFollowers(data.data.users || []);
        console.log('Setting followers in modal:', data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const UserItem: React.FC<{ user: UserData }> = ({ user }) => {
    const navigate = useNavigate();
    const profileImageUrl = user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`;

    const handleUserClick = () => {
      onClose(); // Close the modal first
      navigate(`/profile/${user._id}`);
    };

    return (
      <div className="flex items-center justify-between p-4 border-b border-border last:border-b-0">
        <div
          className="flex items-center space-x-3 flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
          onClick={handleUserClick}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={profileImageUrl}
              alt={`${user.first_name} ${user.last_name}`}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.first_name[0]}{user.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {user.first_name} {user.last_name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-muted-foreground">
                {user.linkupsCount} linkups
              </span>
              <span className="text-xs text-muted-foreground">
                {user.followersCount} followers
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <LinkupButton userId={user._id} className="text-xs" />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linkups" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Linkups {linkups.length}</span>
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Followers {followers.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linkups" className="mt-4">
            <div className="max-h-96 overflow-y-auto">
              {loadingLinkups ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading linkups...</span>
                </div>
              ) : linkups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No linkups yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {linkups.map((user) => (
                    <UserItem key={user._id} user={user} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="followers" className="mt-4">
            <div className="max-h-96 overflow-y-auto">
              {loadingFollowers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading followers...</span>
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No followers yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {followers.map((user) => (
                    <UserItem key={user._id} user={user} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
