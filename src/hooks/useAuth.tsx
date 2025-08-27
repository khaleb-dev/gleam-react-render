
"use client"

import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  authApi,
  type RegisterRequest,
  type LoginRequest,
  type VerifyCodeRequest,
  type ResendVerificationRequest,
} from "../services/authApi"
import { handleApiErrors } from "@/utils/apiResponse"
import { useAppContext } from "@/context/AppContext"
import type { User } from "@/types"
import { socketService, socket } from "@/services/socket"
import { getCookie } from "@/utils/formatUtils"
import { userApiService } from "@/services/userApi"

// Helper function to notify all tabs of auth state change
const notifyAuthChange = () => {
  localStorage.setItem('auth-change', Date.now().toString());
};

// Global verification caching/deduplication across hook instances
let lastVerifyAt = 0;
let lastVerifyResult: any = null;
let verifyInFlightPromise: Promise<any> | null = null;
const VERIFY_TTL = 60_000; // 60 seconds

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

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggingOutRef = useRef(false);
  const verifyTokenAbortController = useRef<AbortController | null>(null);

  const { setUser } = useAppContext()

  // Listen for auth changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-change') {
        console.log('Auth change detected from another tab, refreshing...');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(userData)

      if (response.success) {
        toast.success(typeof response.message === 'string' ? response.message : "Registration successful! Please verify your email.")
        sessionStorage.setItem("authEmail", userData.email)
        navigate("/verify-code")
      } else {
        // For register, message is always a string
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : "Registration failed"
        }
        handleApiErrors(errorResponse)
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      console.log("🔐 Starting login process...");
      const response = await authApi.login(credentials)
      console.log("🔐 Login API response:", { success: response.success, hasData: !!response.data });

      if (response.success) {
        const successMessage = typeof response.message === 'string' ? response.message : "Login successful!"
        toast.success(successMessage)

        const { auth_token, user } = response.data
        console.log("🔐 Login data received:", { hasToken: !!auth_token, hasUser: !!user });

        // Ensure user is valid before setting it
        if (user) {
          console.log("🔐 Setting user in context:", user.user_id);
          setUser(user as User)
          console.log("🔐 User set in context");

          // Connect to socket after successful login
          if (user.user_id && user.role) {
            try {
              // Use the socketService to connect
              socketService.connect(user.user_id, user.role)

              // Add error handling for socket connection
              socket.on("connect_error", (error) => {
                console.error("Socket connection error:", error)
                toast.error("Could not establish live connection. Some features may be limited.")
              })
            } catch (socketError) {
              console.error("Socket connection error:", socketError)
              // Show toast message but don't prevent login
              toast.error("Could not establish live connection. Some features may be limited.")
            }
          }

          // Notify other tabs of auth change
          notifyAuthChange();
          
          // Force immediate auth state verification to prevent stale state
          setTimeout(async () => {
            console.log("🔐 Auth successful, verifying state and navigating...");
            // Clear any cached verification results to force fresh check
            lastVerifyResult = null;
            lastVerifyAt = 0;
            
            // Navigate to intended page or home
            const urlParams = new URLSearchParams(location.search);
            const returnTo = urlParams.get('returnTo');
            navigate(returnTo || "/");
          }, 100);
        } else {
          console.error("🔐 No user data received from login response");
        }
      } else {
        console.log("🔐 Login failed:", response.message);
        // Check if the error is due to unverified email (only for login endpoint)
        if (typeof response.message === 'object' && response.message.verified === false) {
          sessionStorage.setItem("authEmail", credentials.email)
          toast.error("Please verify your email to continue")
          navigate("/verify-code")
        } else {
          // Convert response to handle string message for handleApiErrors
          const errorResponse = {
            ...response,
            message: typeof response.message === 'string' ? response.message : response.message?.message || "Login failed"
          }
          handleApiErrors(errorResponse)
        }
      }
    } catch (error) {
      console.error("🔐 Login error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async (code: string) => {
    setIsLoading(true)
    try {
      const verifyData: VerifyCodeRequest = { code }
      const response = await authApi.verifyCode(verifyData)

      if (response.success) {
        sessionStorage.removeItem("authEmail")
        toast.success(typeof response.message === 'string' ? response.message : "Verification successful!")
        navigate("/login")
      } else {
        // For verifyCode, message is always a string
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : "Verification failed"
        }
        handleApiErrors(errorResponse)
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    setIsLoading(true)
    try {
      const email = sessionStorage.getItem("authEmail")
      const resendData: ResendVerificationRequest = { email }
      const response = await authApi.resendVerification(resendData)

      if (response.success) {
        toast.success(typeof response.message === 'string' ? response.message : "Verification code resent successfully!")
        // Start countdown for 120 seconds (2 minutes)
        setResendCountdown(120)
        const countdownInterval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        // For resendVerification, message is always a string
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : "Resend failed"
        }
        handleApiErrors(errorResponse)
      }
    } catch (error) {
      console.error("Resend verification error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = async (token: string) => {
    setIsLoading(true);
    try {
      console.log("🔐 Starting Google login with token...");
      const response = await authApi.googleLogin(token);

      if (response.success) {
        const successMessage = typeof response.message === 'string' ? response.message : "Google login successful!"
        toast.success(successMessage);

        const { auth_token, user } = response.data;
        console.log("🔐 Google login data received:", { hasToken: !!auth_token, hasUser: !!user });

        if (user) {
          console.log("🔐 Setting user in context:", user.user_id);
          setUser(user as User);

          // Connect to socket after successful login
          if (user.user_id && user.role) {
            try {
              socketService.connect(user.user_id, user.role);
              
              socket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
                toast.error("Could not establish live connection. Some features may be limited.");
              });
            } catch (socketError) {
              console.error("Socket connection error:", socketError);
              toast.error("Could not establish live connection. Some features may be limited.");
            }
          }

          // Notify other tabs of auth change
          notifyAuthChange();
          
          // Force immediate auth state verification to prevent stale state
          setTimeout(async () => {
            console.log("🔐 Google Auth successful, verifying state and navigating...");
            // Clear any cached verification results to force fresh check
            lastVerifyResult = null;
            lastVerifyAt = 0;
            
            // Navigate to intended page or home
            const urlParams = new URLSearchParams(location.search);
            const returnTo = urlParams.get('returnTo');
            navigate(returnTo || "/");
          }, 100);
        } else {
          console.error("🔐 No user data received from Google login response");
          toast.error("Login failed. No user data received.");
        }
      } else {
        console.log("🔐 Google login failed:", response.message);
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : response.message?.message || "Google login failed"
        };
        handleApiErrors(errorResponse);
      }
    } catch (error) {
      console.error("🔐 Google login error:", error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Prevent multiple logout calls
    if (isLoggingOutRef.current) {
      return;
    }
    
    console.log("Manual logout initiated");
    isLoggingOutRef.current = true;

    // Cancel any ongoing token verification
    if (verifyTokenAbortController.current) {
      verifyTokenAbortController.current.abort();
      verifyTokenAbortController.current = null;
    }

    // Disconnect socket before logout
    try {
      socketService.disconnect()
    } catch (error) {
      console.error("Error disconnecting socket:", error)
      // Don't block logout due to socket issues
    }

    try {
      const response = await authApi.logout()
      if (response.success) {
        toast.success(response.message || "Successfully logged out")
      } else {
        toast.error(response.message || "Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("An error occurred during logout")
    }

    // Clear user state and navigate
    setUser(null)
    
    // Notify other tabs of auth change
    notifyAuthChange();
    
    // Reset logout flag after a delay
    setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 1000);

    navigate("/login")
  }

  const verifyAuthToken = async () => {
    // Don't verify if already logging out
    if (isLoggingOutRef.current) {
      return { success: false };
    }

    // Use cached result when fresh
    const now = Date.now();
    if (lastVerifyResult && now - lastVerifyAt < VERIFY_TTL) {
      return lastVerifyResult;
    }

    // Deduplicate concurrent/rapid calls
    if (verifyInFlightPromise) {
      return verifyInFlightPromise;
    }

    // Cancel previous verification if still running (kept for compatibility)
    if (verifyTokenAbortController.current) {
      verifyTokenAbortController.current.abort();
    }
    verifyTokenAbortController.current = new AbortController();

    verifyInFlightPromise = (async () => {
      try {
        const response = await authApi.verifyAuthToken()
        
        // If the local abort controller was aborted, treat as no-op
        if (verifyTokenAbortController.current?.signal.aborted) {
          return { success: false };
        }

        if (!response.success) {
          console.log("🔐 Token verification failed, clearing local state (invalid token)");
          // Only clear local state when the backend explicitly says it's invalid
          setUser(null);
        } else {
          // Token is valid, set user from response
          if (response.data) {
            setUser(response.data);
          }
        }
        return response;
      } catch (error) {
        // Distinguish network/offline from other errors
        if ((error as any)?.name === 'AbortError') {
          return { success: false };
        }

        if (isNetworkError(error)) {
          console.log("🔐 Network issue during token verification, preserving session");
          // Do NOT clear user here; signal offline so guards can handle UX
          return { success: false, offline: true };
        }

        console.error("🔐 Auth token verification error:", error);
        // Non-network errors: clear potentially invalid token
        if (!isLoggingOutRef.current) {
          setUser(null);
        }
        return { success: false };
      } finally {
        verifyTokenAbortController.current = null;
      }
    })();

    try {
      const result = await verifyInFlightPromise;
      lastVerifyResult = result;
      lastVerifyAt = Date.now();
      return result;
    } finally {
      verifyInFlightPromise = null;
    }
  }

  const loggedInUser = async () => {
    try {
      // Leverage caching inside userApiService (prevents burst calls)
      const user = await userApiService.getUserProfile()
      return user.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  return {
    isLoading,
    register,
    login,
    googleLogin,
    verifyCode,
    resendVerification,
    resendCountdown,
    logout,
    verifyAuthToken,
    loggedInUser
  }
}

