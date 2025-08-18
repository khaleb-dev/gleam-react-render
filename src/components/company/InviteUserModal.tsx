import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus, Crown, Shield, User, X, Search } from 'lucide-react';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { useCompanyPageRoles } from '@/hooks/useCompanyPageRoles';
import { useSendMultiplePageInvites } from '@/hooks/useSendPageInvite';

interface InviteUserModalProps {
  pageId: string;
  trigger?: React.ReactNode;
}

interface SelectedMember {
  user_id: string;
  role_id: string;
  user: any;
  role: any;
}

export const InviteUserModal = ({ pageId, trigger }: InviteUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: usersData } = useSuggestedUsers(20);
  const { data: rolesData } = useCompanyPageRoles();
  const sendMultipleInvites = useSendMultiplePageInvites();

  const filteredUsers = usersData?.data?.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = (userId: string, roleId: string) => {
    const user = usersData?.data?.find(u => u._id === userId);
    const role = rolesData?.data?.find(r => r._id === roleId);
    
    if (!user || !role) return;

    // Check if user is already selected
    if (selectedMembers.some(member => member.user_id === userId)) return;

    setSelectedMembers(prev => [...prev, {
      user_id: userId,
      role_id: roleId,
      user,
      role
    }]);
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(member => member.user_id !== userId));
  };

  const handleRoleChange = (userId: string, newRoleId: string) => {
    const role = rolesData?.data?.find(r => r._id === newRoleId);
    if (!role) return;

    setSelectedMembers(prev => prev.map(member => 
      member.user_id === userId 
        ? { ...member, role_id: newRoleId, role }
        : member
    ));
  };

  const handleSendInvites = () => {
    if (selectedMembers.length === 0) return;

    const invites = selectedMembers.map(member => ({
      user_id: member.user_id,
      role_id: member.role_id
    }));

    sendMultipleInvites.mutate(
      { pageId, invites },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSelectedMembers([]);
          setSearchQuery('');
        }
      }
    );
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Members
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 px-1 space-y-4">

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User Selection */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {filteredUsers?.map((user) => {
              const isSelected = selectedMembers.some(member => member.user_id === user._id);
              
              return (
                <div
                  key={user._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    if (!isSelected && rolesData?.data?.[0]) {
                      handleAddMember(user._id, rolesData.data[0]._id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_avatar} />
                      <AvatarFallback>
                        {user.first_name[0]}{user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-muted-foreground">@{user.user_id}</div>
                    </div>
                    {isSelected && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(user._id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Selected Members ({selectedMembers.length})</div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {selectedMembers.map((member) => (
                  <Card key={member.user_id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user.profile_avatar} />
                          <AvatarFallback>
                            {member.user.first_name[0]}{member.user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">
                            {member.user.first_name} {member.user.last_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">Role:</div>
                          <Select 
                            value={member.role_id} 
                            onValueChange={(value) => handleRoleChange(member.user_id, value)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue>
                                <div className="flex items-center gap-1">
                                  {getRoleIcon(member.role.role_name)}
                                  <span className="text-xs">{member.role.role_name}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {rolesData?.data?.map((role) => (
                                <SelectItem key={role._id} value={role._id}>
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(role.role_name)}
                                    <span>{role.role_name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsOpen(false);
              setSelectedMembers([]);
              setSearchQuery('');
            }}
            disabled={sendMultipleInvites.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendInvites}
            disabled={selectedMembers.length === 0 || sendMultipleInvites.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {sendMultipleInvites.isPending ? 'Sending...' : `Send Invites (${selectedMembers.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};