import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Crown, Shield, User } from 'lucide-react';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { useCompanyPageRoles } from '@/hooks/useCompanyPageRoles';
import { useSendPageInvite } from '@/hooks/useSendPageInvite';

interface InviteUserModalProps {
  pageId: string;
  trigger?: React.ReactNode;
}

export const InviteUserModal = ({ pageId, trigger }: InviteUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { data: usersData } = useSuggestedUsers(20);
  const { data: rolesData } = useCompanyPageRoles();
  const sendInvite = useSendPageInvite();

  const handleSendInvite = () => {
    if (!selectedUser || !selectedRole) return;

    sendInvite.mutate(
      { userId: selectedUser, roleId: selectedRole, pageId },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSelectedUser('');
          setSelectedRole('');
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

  const selectedUserData = usersData?.data?.find(user => user._id === selectedUser);
  const selectedRoleData = rolesData?.data?.find(role => role._id === selectedRole);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite User to Company Page</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select User</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user to invite">
                  {selectedUserData && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedUserData.profile_avatar} />
                        <AvatarFallback>
                          {selectedUserData.first_name[0]}{selectedUserData.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedUserData.first_name} {selectedUserData.last_name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {usersData?.data?.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.profile_avatar} />
                        <AvatarFallback>
                          {user.first_name[0]}{user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role">
                  {selectedRoleData && (
                    <div className="flex items-center gap-2">
                      {getRoleIcon(selectedRoleData.role_name)}
                      <span>{selectedRoleData.role_name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {rolesData?.data?.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role.role_name)}
                      <div>
                        <div className="font-medium">{role.role_name}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedUser && selectedRole && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Invite Preview:</div>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedUserData?.profile_avatar} />
                    <AvatarFallback>
                      {selectedUserData?.first_name[0]}{selectedUserData?.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {selectedUserData?.first_name} {selectedUserData?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{selectedUserData?.email}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {getRoleIcon(selectedRoleData?.role_name || '')}
                    <span>{selectedRoleData?.role_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={sendInvite.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvite}
              disabled={!selectedUser || !selectedRole || sendInvite.isPending}
            >
              {sendInvite.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};