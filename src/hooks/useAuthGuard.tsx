import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useAuthGuard = (requireAuth = true) => {
  const { verifyAuthToken } = useAuth()
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVerified, setHasVerified] = useState(false);

  // Check only cookie for auth (no localStorage dependency)
  const hasAuthCookie = document.cookie.includes('authToken=');

  // Verify token on every page load but with optimization
  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasVerified) return;

    const verifyAuth = async () => {
      // If no auth cookie and route requires auth, skip verification and go to login
      if (!hasAuthCookie && requireAuth) {
        console.log("No auth cookie found, skipping verification for protected route");
        setIsAuthenticated(false);
        setIsLoading(false);
        setHasVerified(true);
        return;
      }

      // If no auth cookie and route doesn't require auth, skip verification
      if (!hasAuthCookie && !requireAuth) {
        console.log("No auth cookie found, public route access");
        setIsAuthenticated(false);
        setIsLoading(false);
        setHasVerified(true);
        return;
      }

      if (hasAuthCookie) {
        console.log("Verifying auth token for route:", location.pathname);
        try {
          const result = await verifyAuthToken();
          if (result?.success) {
            setIsAuthenticated(true);
          } else {
            console.log("Token verification failed, clearing auth state");
            setIsAuthenticated(false);
            // Clear the cookie if verification fails
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        } catch (error) {
          console.log("Token verification error:", error);
          setIsAuthenticated(false);
          // Clear the cookie on error
          document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
      }
      
      setIsLoading(false);
      setHasVerified(true);
    };

    verifyAuth();
  }, [hasAuthCookie, location.pathname, hasVerified, verifyAuthToken, requireAuth]);

  // Handle redirect to login when not authenticated (only for protected routes)
  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated && hasVerified) {
      console.log(`Protected route access attempted: ${location.pathname}`);
      toast.error("Please login to access this page");
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, requireAuth, hasVerified]);

  return { isAuthenticated, isLoading };
};
