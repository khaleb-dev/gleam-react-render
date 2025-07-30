import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/services/authApi';
import { handleApiErrors } from '@/utils/apiResponse';
import { PasswordValidation } from '@/components/auth/PasswordValidation';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if user has the required data to reset password
    const { userId } = authApi.getForgotPasswordData();
    if (!userId) {
      toast.error("Session expired. Please start the password reset process again.");
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const { userId, code } = authApi.getForgotPasswordData();

      if (!userId || !code) {
        toast.error("Session expired. Please start over.");
        navigate("/forgot-password");
        return;
      }

      const response = await authApi.resetPassword({
        code,
        new_password: newPassword,
        confirm_password: confirmPassword,
        user_id: userId
      });

      if (response.success) {
        toast.success(typeof response.message === 'string' ? response.message : "Password reset successfully!");
        navigate("/login");
      } else {
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : "Failed to reset password"
        };
        handleApiErrors(errorResponse);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-beembyte-softBlue/30 dark:from-beembyte-darkBlue dark:to-secondary/80 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Logo background */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <img
            src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
            alt=""
            className="w-[800px] h-[800px] dark:invert"
          />
        </div>

        {/* Blur effects */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-beembyte-blue/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Return to landing */}
      <Link to="/landing" className="absolute top-6 left-6 flex items-center space-x-2 text-beembyte-darkBlue dark:text-white">
        <img
          src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
          alt="beembyte"
          className="h-8 w-auto invert dark:invert-0"
        />
        <span className="font-bold">beembyte</span>
      </Link>

      <Card className="w-full max-w-md shadow-lg border-0 dark:bg-gray-900/70 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-beembyte-darkBlue dark:text-white">Create New Password</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 pr-10 focus:border-beembyte-blue"
                  required
                  minLength={8}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword && <PasswordValidation password={newPassword} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10 focus:border-beembyte-blue"
                  required
                  minLength={8}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-beembyte-lightBlue"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link
            to="/login"
            className="flex items-center text-sm text-beembyte-blue hover:underline"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
