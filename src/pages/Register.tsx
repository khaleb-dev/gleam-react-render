import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { PasswordValidation } from '@/components/auth/PasswordValidation';

const Register = () => {
  const { register, googleLogin, isLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      password,
      confirm_password: confirmPassword,
    };
    
    await register(userData);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    if (token) {
      await googleLogin(token);
    }
  };

  const handleGoogleError = () => {
    console.error('Google signup failed');
  };
  
  const handleOAuthSignup = (provider: string) => {
    // OAuth functionality would be implemented here
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
          <CardTitle className="text-2xl font-bold text-beembyte-darkBlue dark:text-white">Create an account</CardTitle>
          <CardDescription>
            Join beembyte to start uploading tasks
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="credentials">Sign Up Form</TabsTrigger>
              <TabsTrigger value="social">Social Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="focus:border-beembyte-blue"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="focus:border-beembyte-blue"
                      required
                    />
                  </div>
                </div>
                
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
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08012345678"
                    className="focus:border-beembyte-blue"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                  {password && <PasswordValidation password={password} />}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 focus:border-beembyte-blue"
                      required
                    />
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
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <UserPlus size={16} className="mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="social">
              <div className="grid gap-4">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    size="large"
                    width="100"
                    text="signup_with"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleOAuthSignup('GitHub')}
                  className="w-full"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  Sign up with GitHub
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={isLoading}
                  onClick={() => handleOAuthSignup('Apple')}
                  className="w-full"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                  </svg>
                  Sign up with Apple
                </Button>
              </div>
              
              <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                By signing up, you agree to our 
                <a href="/terms" className="text-beembyte-blue hover:underline mx-1">Terms of Service</a>
                and 
                <a href="/terms" className="text-beembyte-blue hover:underline ml-1">Privacy Policy</a>.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter>
          <div className="text-center w-full">
            <span className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-beembyte-blue hover:underline font-medium">
                Sign in
              </Link>
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
