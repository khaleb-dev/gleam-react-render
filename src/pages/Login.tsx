import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const { login, googleLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    if (token) {
      await googleLogin(token);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  // Extract the returnTo parameter if present
  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo') || '/';

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
        <div className="absolute top-20 left-20 w-72 h-72 bg-beembyte-blue/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
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
          <CardTitle className="text-2xl font-bold text-beembyte-darkBlue dark:text-white">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="focus:border-beembyte-blue"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password"
                  className="text-sm text-beembyte-blue hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 focus:border-beembyte-blue"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              size="large"
              width="100"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center w-full">
            <span className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-beembyte-blue hover:underline font-medium">
                Create one now
              </Link>
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
