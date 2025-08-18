import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Crown, Shield, User } from 'lucide-react';
import { usePendingPageMembers } from '@/hooks/usePendingPageMembers';
import type { PendingPageMember } from '@/services/pageMembers';

interface PendingMembersListProps {
  pageId: string;
  showTitle?: boolean;
}

export const PendingMembersList = ({ pageId, showTitle = true }: PendingMembersListProps) => {
  const { data: pendingMembersData, isLoading } = usePendingPageMembers(pageId);

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super_admin':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
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

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invites
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingMembersData?.data?.members?.length) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invites
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No pending invites</p>
        </CardContent>
      </Card>
    );
  }

  const pendingMembers = pendingMembersData.data.members;

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invites ({pendingMembers.length})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {pendingMembers.map((member: PendingPageMember) => (
            <Card key={member._id} className="p-4 hover:shadow-md transition-all duration-300">
              {/* Mobile Layout - Horizontal */}
              <div className="flex md:hidden items-center space-x-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage 
                    src={member.user_id.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.user_id.first_name)}`}
                    alt={`${member.user_id.first_name} ${member.user_id.last_name}`}
                  />
                  <AvatarFallback>
                    {member.user_id.first_name.charAt(0)}{member.user_id.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {member.user_id.first_name} {member.user_id.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {member.user_id.email}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={getRoleBadgeVariant(member.role_id.role_name)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {getRoleIcon(member.role_id.role_name)}
                      {member.role_id.role_name}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Invited by {member.invited_by.first_name} {member.invited_by.last_name}
                  </p>
                </div>
              </div>

              {/* Desktop Layout - Vertical */}
              <div className="hidden md:flex flex-col items-center space-y-3 text-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={member.user_id.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.user_id.first_name)}`}
                    alt={`${member.user_id.first_name} ${member.user_id.last_name}`}
                  />
                  <AvatarFallback>
                    {member.user_id.first_name.charAt(0)}{member.user_id.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {member.user_id.first_name} {member.user_id.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.user_id.email}
                  </p>
                </div>
                
                <Badge 
                  variant={getRoleBadgeVariant(member.role_id.role_name)}
                  className="flex items-center gap-1 text-xs mx-auto w-fit"
                >
                  {getRoleIcon(member.role_id.role_name)}
                  {member.role_id.role_name}
                </Badge>
                
                <p className="text-xs text-muted-foreground">
                  Invited by {member.invited_by.first_name} {member.invited_by.last_name}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};