
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, Shield } from 'lucide-react';
import { usePageMembers } from '@/hooks/usePageMembers';
import { PendingMembersList } from './PendingMembersList';
import type { PageMember } from '@/services/pageMembers';

interface MembersListProps {
  pageId: string;
  showTitle?: boolean;
  compact?: boolean;
}

export const MembersList = ({ pageId, showTitle = true, compact = false }: MembersListProps) => {
  const { data: membersData, isLoading } = usePageMembers(pageId);

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

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members
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

  if (!membersData?.data?.members?.length) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-gray-500 text-center py-4">No members found</p>
        </CardContent>
      </Card>
    );
  }

  const members = membersData.data.members.filter(member => member.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Pending Members */}
      <PendingMembersList pageId={pageId} />
      
      {/* Approved Members */}
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {members.map((member: PageMember) => (
              <Card key={member._id} className="p-4 w-64 flex-shrink-0 hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.user_id.first_name)}`}
                      alt={`${member.user_id.first_name} ${member.user_id.last_name}`}
                    />
                    <AvatarFallback>
                      {member.user_id.first_name.charAt(0)}{member.user_id.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium text-sm mb-1">
                    {member.user_id.first_name} {member.user_id.last_name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">{member.user_id.email}</p>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getRoleBadgeVariant(member.role_id.role_name)} className="text-xs w-fit mx-auto">
                      <span className="flex items-center gap-1">
                        {getRoleIcon(member.role_id.role_name)}
                        {member.role_id.role_name}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
