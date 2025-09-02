import { API_BASE_URL } from "../config/env";

interface FieldError {
  msg: string;
  field?: string;
}

// Type definitions for requests and responses
export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyCodeRequest {
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  code: string;
  type: string;
}

export interface ResetPasswordRequest {
  code: string;
  new_password: string;
  confirm_password: string;
  user_id: string;
}

export interface AuthResponse {
  errors?: FieldError[];
  success: boolean;
  message: string | { message: string; verified: boolean };
  data?: any;
  token?: string;
}

export interface VerifyOtpResponse {
  message: string;
  data: {
    email: string;
    user_id: string;
  };
  success: boolean;
}

// Helper function to manually set auth token if server doesn't set cookie
const setAuthTokenManually = (token: string) => {
  if (token) {
    try {
      // Set cookie manually as fallback
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry
      document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax; ${
        window.location.protocol === "https:" ? "Secure;" : ""
      }`;
      console.log(
        "🍪 Manually set auth token cookie:",
        token.substring(0, 10) + "..."
      );
      console.log("🍪 Cookie after manual set:", document.cookie);
    } catch (error) {
      console.error("🍪 Failed to set auth token manually:", error);
    }
  }
};

// Helper function to clear auth token cookie
const clearAuthTokenCookie = () => {
  try {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("🍪 Auth token cookie cleared");
  } catch (error) {
    console.error("🍪 Failed to clear auth token cookie:", error);
  }
};

// Set forgot password data in cookie
const setForgotPasswordCookie = (userId: string, code: string) => {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 15); // 15 minutes expiry
  document.cookie = `forgotPasswordUserId=${userId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  document.cookie = `forgotPasswordCode=${code}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
};

// Get forgot password data from cookie
const getForgotPasswordData = () => {
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  return {
    userId: getCookie("forgotPasswordUserId"),
    code: getCookie("forgotPasswordCode"),
  };
};

// Clear forgot password cookies
const clearForgotPasswordCookies = () => {
  document.cookie =
    "forgotPasswordUserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "forgotPasswordCode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

// Authentication API service
export const authApi = {
  // Register a new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Failed to register. Please try again later.",
      };
    }
  },

  // Login a user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const data = await response.json();
      // Check if cookies are set after login
      if (data.success) {
        // Check if server set the auth cookie
        const hasAuthCookie = document.cookie.includes("authToken=");
        // If server didn't set cookie but we have a token, set it manually
        if (!hasAuthCookie && data.data?.auth_token) {
          setAuthTokenManually(data.data.auth_token);

          // Verify manual cookie setting worked
          setTimeout(() => {
            const hasAuthCookieAfterManual =
              document.cookie.includes("authToken=");
            console.log(
              "🍪 Auth cookie present after manual set:",
              hasAuthCookieAfterManual
            );
            console.log("🍪 Final document cookies:", document.cookie);
          }, 100);
        }
      }

      return data;
    } catch (error) {
      console.error("🌐 Login error:", error);
      return {
        success: false,
        message: "Failed to login. Please try again later.",
      };
    }
  },

  // Verify signup code
  verifyCode: async (verifyData: VerifyCodeRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/signup-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verifyData),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Verification error:", error);
      return {
        success: false,
        message: "Failed to verify code. Please try again later.",
      };
    }
  },

  // Resend verification code
  resendVerification: async (
    resendData: ResendVerificationRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/resend-signup-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resendData),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        message: "Failed to resend verification code. Please try again later.",
      };
    }
  },

  // Google OAuth login with token
  googleLogin: async (token: string): Promise<AuthResponse> => {
    try {
      console.log(
        "🌐 Making Google login request to:",
        `${API_BASE_URL}/users/google-login`
      );

      const response = await fetch(`${API_BASE_URL}/users/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        credentials: "include",
      });

      console.log("🌐 Google login response status:", response.status);
      console.log(
        "🌐 Google login response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log("🌐 Google login response data:", {
        success: data.success,
        hasData: !!data.data,
        hasToken: !!data.data?.auth_token,
      });

      // Check if cookies are set after login
      if (data.success) {
        console.log(
          "🍪 Document cookies immediately after Google login:",
          document.cookie
        );

        // Check if server set the auth cookie
        const hasAuthCookie = document.cookie.includes("authToken=");
        console.log(
          "🍪 Auth cookie present after server response:",
          hasAuthCookie
        );

        // If server didn't set cookie but we have a token, set it manually
        if (!hasAuthCookie && data.data?.auth_token) {
          console.log("🍪 Server didn't set cookie, setting manually...");
          setAuthTokenManually(data.data.auth_token);

          // Verify manual cookie setting worked
          setTimeout(() => {
            const hasAuthCookieAfterManual =
              document.cookie.includes("authToken=");
            console.log(
              "🍪 Auth cookie present after manual set:",
              hasAuthCookieAfterManual
            );
            console.log("🍪 Final document cookies:", document.cookie);
          }, 100);
        }
      }

      return data;
    } catch (error) {
      console.error("🌐 Google login error:", error);
      return {
        success: false,
        message: "Google login failed. Please try again later.",
      };
    }
  },

  // Handle Google OAuth callback with authorization code
  handleGoogleOAuthCallback: async (
    code: string,
    state?: string
  ): Promise<AuthResponse> => {
    try {
      console.log(
        "🌐 Making Google OAuth callback request to:",
        `${API_BASE_URL}/users/google-oauth-callback`
      );

      const response = await fetch(
        `${API_BASE_URL}/users/google-oauth-callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
          credentials: "include",
        }
      );

      const data = await response.json();

      // Handle auth token setting like in regular login
      if (data.success && data.data?.auth_token) {
        const hasAuthCookie = document.cookie.includes("authToken=");
        if (!hasAuthCookie) {
          setAuthTokenManually(data.data.auth_token);
        }
      }

      return data;
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      return {
        success: false,
        message: "Google OAuth authentication failed. Please try again.",
      };
    }
  },

  // Handle OAuth callback (keep for backward compatibility)
  handleOAuthCallback: async (
    code: string,
    state?: string
  ): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, state }),
        credentials: "include",
      });

      const data = await response.json();

      // Handle auth token setting like in regular login
      if (data.success && data.data?.auth_token) {
        const hasAuthCookie = document.cookie.includes("authToken=");
        if (!hasAuthCookie) {
          setAuthTokenManually(data.data.auth_token);
        }
      }

      return data;
    } catch (error) {
      console.error("OAuth callback error:", error);
      return {
        success: false,
        message: "OAuth authentication failed. Please try again.",
      };
    }
  },

  // Forgot password - send email
  forgotPassword: async (
    forgotData: ForgotPasswordRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forgotData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: "Failed to send reset email. Please try again later.",
      };
    }
  },

  // Verify OTP for forgot password
  verifyOtp: async (otpData: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otpData),
      });

      const data = await response.json();

      // Store user_id and code for password reset
      if (data.success && data.data?.user_id) {
        setForgotPasswordCookie(data.data.user_id, otpData.code);
      }

      return data;
    } catch (error) {
      console.error("OTP verification error:", error);
      return {
        success: false,
        message: "Failed to verify OTP. Please try again later.",
        data: { email: "", user_id: "" },
      };
    }
  },

  // Reset password
  resetPassword: async (
    resetData: ResetPasswordRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetData),
      });

      const data = await response.json();

      // Clear forgot password cookies after successful reset
      if (data.success) {
        clearForgotPasswordCookies();
      }

      return data;
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Failed to reset password. Please try again later.",
      };
    }
  },

  // Get forgot password data
  getForgotPasswordData,

  // Clear forgot password data
  clearForgotPasswordCookies,

  // Logout user - cookies are cleared by server
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/logout`, {
        method: "POST",
        credentials: "include", // Required to send cookies
      });

      const data = await response.json();
      clearForgotPasswordCookies();
      clearAuthTokenCookie();

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      clearForgotPasswordCookies();
      clearAuthTokenCookie();
      return {
        success: false,
        message: "Logout failed. Please try again.",
      };
    }
  },

  verifyAuthToken: async () => {
    try {
      // Add timeout controller to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/users/verify-auth-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: controller.signal, // Add abort signal
      });

      clearTimeout(timeoutId); // Clear timeout on successful response

      // If request failed completely, clear the cookie and return failure
      if (!response.ok) {
        console.log("🔐 Auth token verification failed, clearing cookie");
        clearAuthTokenCookie();
        return {
          success: false,
          message: "Token verification failed",
        };
      }

      const data = await response.json();

      // If token is invalid or expired, clear the cookie
      if (!data.success) {
        console.log("🔐 Auth token invalid or expired, clearing cookie");
        clearAuthTokenCookie();
      }

      return data;
    } catch (error) {
      console.error("verify auth token error:", error);

      // Handle timeout specifically
      if (error.name === "AbortError") {
        console.log("🔐 Auth token verification timed out, clearing cookie");
        clearAuthTokenCookie();
        return {
          success: false,
          message: "Token verification timed out",
        };
      }

      // Clear cookie on any error
      clearAuthTokenCookie();
      return {
        success: false,
        message: "Failed to verify auth token. Please try again later.",
      };
    }
  },
};
