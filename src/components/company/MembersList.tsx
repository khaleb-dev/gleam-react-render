
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
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {members.map((member: PageMember) => (
              <Card key={member._id} className="p-6 hover:shadow-md transition-all duration-300 text-center">
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 mb-3">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.user_id.first_name)}`}
                        alt={`${member.user_id.first_name} ${member.user_id.last_name}`}
                      />
                      <AvatarFallback className="text-lg">
                        {member.user_id.first_name.charAt(0)}{member.user_id.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-base">
                      {member.user_id.first_name} {member.user_id.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
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
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
