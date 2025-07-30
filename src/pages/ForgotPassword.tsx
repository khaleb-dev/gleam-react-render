import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Mail, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/services/authApi';
import { handleApiErrors } from '@/utils/apiResponse';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword({ email });

      if (response.success) {
        toast.success(typeof response.message === 'string' ? response.message : "Reset instructions sent successfully");
        localStorage.setItem("forgotPasswordEmail", email);
        setIsSubmitted(true);
      } else {
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : "Failed to send reset instructions"
        };
        handleApiErrors(errorResponse);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToVerification = () => {
    navigate('/verify-otp');
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
          <CardTitle className="text-2xl font-bold text-beembyte-darkBlue dark:text-white">Reset Password</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            {isSubmitted
              ? "Check your email for the verification code"
              : "Enter your email and we'll send you a verification code"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div className="space-y-6">
              <Alert>
                <AlertDescription>
                  We've sent a verification code to <span className="font-medium">{email}</span>.
                  Please check your inbox and enter the code to proceed.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-4">
                <Button
                  onClick={handleProceedToVerification}
                  className="w-full bg-primary hover:bg-beembyte-lightBlue"
                >
                  Enter Verification Code
                </Button>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Try a different email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 focus:border-beembyte-blue"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
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
                    Sending Code...
                  </span>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>
          )}
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

export default ForgotPassword;
