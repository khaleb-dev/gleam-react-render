import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Crown, Shield, User, X } from 'lucide-react';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { useCompanyPageRoles } from '@/hooks/useCompanyPageRoles';
import { useSendBulkPageInvites } from '@/hooks/useSendPageInvite';

interface InviteUserModalProps {
  pageId: string;
  trigger?: React.ReactNode;
}

export const InviteUserModal = ({ pageId, trigger }: InviteUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Array<{ userId: string; roleId: string }>>([]);
  const [defaultRole, setDefaultRole] = useState<string>('');

  const { data: usersData } = useSuggestedUsers(20);
  const { data: rolesData } = useCompanyPageRoles();
  const sendBulkInvites = useSendBulkPageInvites();

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked && defaultRole) {
      setSelectedUsers(prev => [...prev, { userId, roleId: defaultRole }]);
    } else {
      setSelectedUsers(prev => prev.filter(item => item.userId !== userId));
    }
  };

  const handleRoleChange = (userId: string, roleId: string) => {
    setSelectedUsers(prev => 
      prev.map(item => 
        item.userId === userId ? { ...item, roleId } : item
      )
    );
  };

  const handleDefaultRoleChange = (roleId: string) => {
    setDefaultRole(roleId);
    // Update all selected users with the new default role if they don't have a specific role set
    setSelectedUsers(prev => 
      prev.map(item => ({ ...item, roleId }))
    );
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(item => item.userId !== userId));
  };

  const handleSendInvites = () => {
    if (selectedUsers.length === 0) return;

    const invites = selectedUsers.map(item => ({
      user_id: item.userId,
      role_id: item.roleId
    }));

    sendBulkInvites.mutate(
      { pageId, invites },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSelectedUsers([]);
          setDefaultRole('');
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

  const defaultRoleData = rolesData?.data?.find(role => role._id === defaultRole);

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
          {/* Default Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Default Role</label>
            <Select value={defaultRole} onValueChange={handleDefaultRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a default role">
                  {defaultRoleData && (
                    <div className="flex items-center gap-2">
                      {getRoleIcon(defaultRoleData.role_name)}
                      <span>{defaultRoleData.role_name}</span>
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

          {/* User Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Users</label>
            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3">
              {usersData?.data?.map((user) => {
                const isSelected = selectedUsers.some(item => item.userId === user._id);
                return (
                  <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleUserToggle(user._id, checked as boolean)}
                      disabled={!defaultRole}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_avatar} />
                      <AvatarFallback>
                        {user.first_name[0]}{user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Users Preview */}
          {selectedUsers.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Selected Users ({selectedUsers.length})</label>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {selectedUsers.map((item) => {
                  const userData = usersData?.data?.find(user => user._id === item.userId);
                  const roleData = rolesData?.data?.find(role => role._id === item.roleId);
                  
                  return (
                    <Card key={item.userId} className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userData?.profile_avatar} />
                          <AvatarFallback>
                            {userData?.first_name[0]}{userData?.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {userData?.first_name} {userData?.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{userData?.email}</div>
                        </div>
                        <Select value={item.roleId} onValueChange={(roleId) => handleRoleChange(item.userId, roleId)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              {roleData && (
                                <div className="flex items-center gap-1">
                                  {getRoleIcon(roleData.role_name)}
                                  <span className="text-xs">{roleData.role_name}</span>
                                </div>
                              )}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUser(item.userId)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={sendBulkInvites.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvites}
              disabled={selectedUsers.length === 0 || sendBulkInvites.isPending}
            >
              {sendBulkInvites.isPending ? 'Sending...' : `Send ${selectedUsers.length} Invite${selectedUsers.length === 1 ? '' : 's'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};