import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { RESPONDER_BASE_URL } from '@/config/env';

export const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedInUser, logout } = useAuth();

  // Check authentication status on mount and route changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const hasAuthCookie = document.cookie.includes("authToken=")
      const storedUser = localStorage.getItem("authorizeUser")
      const authStatus = hasAuthCookie && !!storedUser

      console.log('Auth check - Cookie:', hasAuthCookie, 'StoredUser:', !!storedUser, 'AuthStatus:', authStatus);

      setIsAuthenticated(authStatus)

      if (authStatus && storedUser) {
        // Get user from localStorage immediately for UI display
        try {
          const storedUserData = JSON.parse(storedUser);
          if (storedUserData && storedUserData.first_name) {
            setUser(storedUserData);
            console.log('User from localStorage:', storedUserData.first_name);
          }
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
        }
      } else {
        setUser(null);
      }

      setIsLoadingUser(false);
    };

    checkAuthStatus();
  }, [location.pathname]); // Re-check on route changes

  // Also check periodically for cookie changes (in case login happens in another tab/component)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const hasAuthCookie = document.cookie.includes("authToken=")
      const storedUser = localStorage.getItem("authorizeUser")
      const authStatus = hasAuthCookie && !!storedUser

      if (authStatus !== isAuthenticated) {
        console.log('Auth status changed - updating header');
        setIsAuthenticated(authStatus);

        if (authStatus && storedUser) {
          try {
            const storedUserData = JSON.parse(storedUser);
            if (storedUserData && storedUserData.first_name) {
              setUser(storedUserData);
            }
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
          }
        } else {
          setUser(null);
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Separate effect for API user fetch (non-blocking)
  useEffect(() => {
    let isMounted = true;
    let hasFetched = false;

    const fetchUserFromApi = async () => {
      if (isAuthenticated && !isLoadingUser && !hasFetched) {
        hasFetched = true;
        try {
          const userFromApi = await loggedInUser();
          if (userFromApi && isMounted) {
            setUser(userFromApi);
            console.log('User from API:', userFromApi.first_name);
            // Update localStorage with fresh data
            localStorage.setItem("authorizeUser", JSON.stringify(userFromApi));
          }
        } catch (error) {
          console.error('Error fetching user from API:', error);
          // Don't logout on API error - keep using localStorage data
        }
      }
    };

    fetchUserFromApi();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isLoadingUser]);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/landing');
  };

  // Generate a Dicebear URL using the user's first name as the seed
  const dicebearUrl = user?.first_name ?
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}` :
    '';

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/landing" className="flex items-center">
              <img
                src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
                alt="beembyte"
                className="h-7 w-auto mr-2 invert dark:invert-0"
              />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">beembyte</h1>
            </Link>
            <div className="hidden md:flex items-center space-x-8 ml-10">
              {/* Only show Explore when authenticated */}
              {isAuthenticated && (
                <Link to="/feed" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">Explore</Link>
              )}
              <Link to="/about" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">About Us</Link>
              <a href="#features" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">Features</a>
              <Link to="/help" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">Help</Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">Dashboard</Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="outline" className="hidden md:inline-flex text-xs border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                    Sign In
                  </Button>
                </Link>

                {/* Signup Dropdown for Desktop */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/80 text-white text-xs">
                        Choose Your Path
                        <ChevronDown size={14} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-sm font-medium text-gray-900">
                        Choose your path
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate('/register')}
                        className="text-sm cursor-pointer"
                      >
                        <span className="mr-2">📋</span>
                        <div>
                          <div className="font-medium">Register</div>
                          <div className="text-xs text-gray-500">Post update to the community</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(RESPONDER_BASE_URL, "_blank")}
                        className="text-sm cursor-pointer"
                      >
                        <span className="mr-2">🎯</span>
                        <div>
                          <div className="font-medium">Become an Expert</div>
                          <div className="text-xs text-gray-500">Use your skills to earn money</div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile signup dropdown button */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/80 text-white text-xs">
                        Join
                        <ChevronDown size={14} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 z-50 bg-white border border-gray-200 shadow-lg">
                      <DropdownMenuLabel className="text-sm font-medium text-gray-900">
                        Choose your path
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate('/register')}
                        className="text-sm cursor-pointer p-3"
                      >
                        <span className="mr-3 text-lg">📋</span>
                        <div>
                          <div className="font-medium">Register</div>
                          <div className="text-xs text-gray-500">Post update to the community</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(RESPONDER_BASE_URL, "_blank")}
                        className="text-sm cursor-pointer p-3"
                      >
                        <span className="mr-3 text-lg">🎯</span>
                        <div>
                          <div className="font-medium">Become an Expert</div>
                          <div className="text-xs text-gray-500">Use your skills to earn money</div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/create-task">
                  <Button className="bg-primary hover:bg-primary/80 text-white text-xs">
                    Create Task
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer h-8 w-8">
                      <AvatarImage
                        src={dicebearUrl}
                        alt={user?.first_name}
                        onError={(e) => {
                          console.error('Failed to load dicebear image in public header:', dicebearUrl);
                        }}
                      />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {user?.first_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-sm">
                      {user?.first_name} {user?.last_name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-sm">
                      <User size={16} className="mr-2" />Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-sm">
                      <User size={16} className="mr-2" />Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')} className="text-sm">
                      <span className="mr-2">💰</span>Wallet
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-sm">
                      <LogOut size={16} className="mr-2" />Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile menu button - moved to right with profile integration */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <div className="flex items-center space-x-2">
                    {isAuthenticated && user && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={dicebearUrl}
                          alt={user.first_name}
                          onError={(e) => {
                            console.error('Failed to load dicebear image in public header mobile:', dicebearUrl);
                          }}
                        />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {user.first_name?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Button variant="ghost" className="p-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px] pt-12">
                  <div className="flex flex-col space-y-6">
                    {/* Only show Explore when authenticated */}
                    {isAuthenticated && (
                      <Link
                        to="/feed"
                        className="text-gray-800 hover:text-primary dark:text-white font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Explore
                      </Link>
                    )}
                    <Link
                      to="/about"
                      className="text-gray-800 hover:text-primary dark:text-white font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>

                    <a
                      href="#features"
                      className="text-gray-800 hover:text-primary dark:text-white font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Features
                    </a>
                    <Link
                      to="/help"
                      className="text-gray-800 hover:text-primary dark:text-white font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Help Center
                    </Link>

                    {isAuthenticated && (
                      <Link
                        to="/dashboard"
                        className="text-gray-800 hover:text-primary dark:text-white font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}

                    <div className="pt-4 flex flex-col space-y-4">
                      {!isAuthenticated ? (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-100">Sign In</Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          {user && (
                            <div className="text-center py-2 border-b border-gray-200">
                              <Avatar className="mx-auto h-12 w-12 mb-2">
                                <AvatarImage
                                  src={dicebearUrl}
                                  alt={user.first_name}
                                  onError={(e) => {
                                    console.error('Failed to load dicebear image in public header mobile sheet:', dicebearUrl);
                                  }}
                                />
                                <AvatarFallback className="bg-primary text-white">
                                  {user.first_name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-100">Profile</Button>
                          </Link>
                          <Link
                            to="/wallet"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-100">Wallet</Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                          >
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
