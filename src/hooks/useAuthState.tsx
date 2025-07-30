import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

// Global auth state hook that verifies token on every page load
export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { verifyAuthToken } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await verifyAuthToken();
        if (response?.success && response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if we have an auth cookie before attempting verification
    const hasAuthCookie = document.cookie.includes('authToken=');
    if (hasAuthCookie) {
      verifyAuth();
    } else {
      setUser(null);
      setIsLoading(false);
    }

    // Listen for auth changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-change') {
        console.log('Auth state changed in another tab');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [verifyAuthToken]);

  return { user, isLoading, isAuthenticated: !!user };
};
