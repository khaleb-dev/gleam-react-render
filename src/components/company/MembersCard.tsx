import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCheck, Crown, Shield, Users } from 'lucide-react';
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

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super_admin':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

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
    <Card className="p-4 md:p-6 hover:shadow-md transition-all duration-300 cursor-pointer relative w-full">
      <CardContent className="p-0">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage
              style={{ objectFit: 'cover' }}
              src={member.user_id ? member.user_id.profile_avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.user_id.first_name)}`}
              alt={`${member.user_id.first_name} ${member.user_id.last_name}`}
            />
            <AvatarFallback className="text-lg">
              {member.user_id.first_name.charAt(0)}{member.user_id.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              {member.user_id.first_name} {member.user_id.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {member.user_id.email}
            </p>
          </div>

          <Badge
            variant={getRoleBadgeVariant(member.role_id.role_name)}
            className="flex items-center justify-center gap-1 text-xs mx-auto w-fit"
          >
            {getRoleIcon(member.role_id.role_name)}
            {member.role_id.role_name}
          </Badge>

          <div className="text-xs text-muted-foreground">
            <p>Joined {new Date(member.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {!isOwnProfile && (
          <Button
            size="icon"
            variant={status.isLinkedUp ? "secondary" : "default"}
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleLinkupClick}
            disabled={isLoading}
          >
            {status.isLinkedUp ? (
              <UserCheck className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};