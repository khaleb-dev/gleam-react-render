import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserCheck } from 'lucide-react';
import { useLinkup } from '@/hooks/useLinkup';
import { useAuth } from '@/hooks/useAuth';
import type { PageMember } from '@/services/pageMembers';

interface MembersCardProps {
  member: PageMember;
}

export const MembersCard = ({ member }: MembersCardProps) => {
  const { loggedInUser } = useAuth();
  const { status, linkup, unlinkup, isLoading } = useLinkup(member.user_id._id);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await loggedInUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchUser();
  }, [loggedInUser]);
  
  const isOwnProfile = currentUser?.user_id === member.user_id._id;

  const handleLinkupClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status.isLinkedUp) {
      await unlinkup();
    } else {
      await linkup();
    }
  };

  return (
    <Card className="p-3 hover:shadow-md transition-all duration-300 cursor-pointer relative">
      <CardContent className="p-0">
        <div className="flex flex-col items-center text-center space-y-2">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.user_id.first_name)}`}
              alt={`${member.user_id.first_name} ${member.user_id.last_name}`}
            />
            <AvatarFallback>
              {member.user_id.first_name.charAt(0)}{member.user_id.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium truncate">
              {member.user_id.first_name} {member.user_id.last_name}
            </p>
          </div>
        </div>
        
        {!isOwnProfile && (
          <Button
            size="icon"
            variant={status.isLinkedUp ? "secondary" : "default"}
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleLinkupClick}
            disabled={isLoading}
          >
            {status.isLinkedUp ? (
              <UserCheck className="h-3 w-3" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};