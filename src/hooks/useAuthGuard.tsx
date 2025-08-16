import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Track whether we've already shown an offline toast in this session
let offlineToastShown = false;

export const useAuthGuard = (requireAuth = true) => {
  const { verifyAuthToken } = useAuth()
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVerified, setHasVerified] = useState(false);

  // Reset single-toast guard when we come back online
  useEffect(() => {
    const onOnline = () => {
      offlineToastShown = false;
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  // Check only cookie for auth (no localStorage dependency)
  const hasAuthCookie = document.cookie.includes('authToken=');

  // Helper to detect network/offline errors when verifyAuthToken throws
  const isNetworkError = (error: unknown) => {
    if (typeof window !== 'undefined' && !navigator.onLine) return true;
    if (error instanceof Error) {
      return (
        error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed')
      );
    }
    return false;
  };

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
          const result: any = await verifyAuthToken();
          if (result?.success) {
            setIsAuthenticated(true);
          } else if (result?.offline) {
            // Network issue: keep user in place, do not clear cookie or redirect
            setIsAuthenticated(true);
            if (!offlineToastShown) {
              offlineToastShown = true;
              toast.error("Network connection issue. You're still signed in; some features may be limited.");
            }
          } else {
            console.log("Token verification failed, clearing auth state");
            setIsAuthenticated(false);
            // Clear the cookie if verification fails (only for real invalid token)
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        } catch (error) {
          console.log("Token verification error:", error);
          if (isNetworkError(error)) {
            // Network error: keep session, single toast, no redirect
            setIsAuthenticated(true);
            if (!offlineToastShown) {
              offlineToastShown = true;
              toast.error("Network connection issue. You're still signed in; some features may be limited.");
            }
          } else {
            setIsAuthenticated(false);
            // Clear the cookie on non-network errors
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
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
