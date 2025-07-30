import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User } from '@/types';

interface ProfileInfoProps {
  user: User | null;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileInfo = ({ user, isEditing, onCancel, onSubmit }: ProfileInfoProps) => {
  if (!user) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 w-32 rounded animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 w-24 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 w-full rounded animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Edit Profile Information</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={user.first_name || ''}
                placeholder="Your first name"
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={user.last_name || ''}
                placeholder="Your last name"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ''}
              placeholder="Your email address"
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="text"
              value={user.phone_number || ''}
              placeholder="Your phone number"
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-sm font-semibold mb-4">Profile Details</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">Full Name</h3>
            <p className="text-gray-900 text-xs">{user.first_name} {user.last_name}</p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-gray-900 text-xs break-all">{user.email}</p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">Phone Number</h3>
            <p className="text-gray-900 text-xs">{user.phone_number || 'Not provided'}</p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">Account Status</h3>
            <p className="text-gray-900 text-xs">{user.status || 'Active'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
