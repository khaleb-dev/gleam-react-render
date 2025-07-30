import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { PasswordValidation } from '@/components/auth/PasswordValidation';
import { userApiService } from '@/services/userApi';
import { handleApiErrors } from '@/utils/apiResponse';

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await userApiService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (response.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : "Failed to change password"
        };
        handleApiErrors(errorResponse);
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Change Password</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs">Update your account password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="pl-8 pr-8 focus:border-beembyte-blue text-xs h-8"
              required
            />
            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="newPassword" className="text-xs">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="pl-8 pr-8 focus:border-beembyte-blue text-xs h-8"
              required
              minLength={8}
            />
            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {newPassword && <PasswordValidation password={newPassword} />}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmNewPassword" className="text-xs">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="pl-8 pr-8 focus:border-beembyte-blue text-xs h-8"
              required
              minLength={8}
            />
            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-beembyte-lightBlue text-xs h-8 px-3"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Changing Password...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
