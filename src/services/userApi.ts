import { API_BASE_URL } from '@/config/env';

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
    is_verified: boolean;
    status: string;
    has_set_transaction_pin: boolean;
    wallet_id: {
      _id: string;
      user_id: string;
      type: string;
      balance: number;
      locked_balance: number;
      currency: string;
      createdAt: string;
      updatedAt: string;
    };
    user_id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface GetUserByIdResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_avatar: string;
    role: string;
    is_verified: boolean;
    status: string;
  };
}

export interface SearchUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_avatar?: string;
  roles: string[];
  is_verified: boolean;
  status: string;
  responder?: {
    _id: string;
    job_title: string;
    availability_status: string;
  };
}

export interface SearchUsersResponse {
  success: boolean;
  message: string;
  data: SearchUser[];
}

// Simple in-memory cache & in-flight deduplication for user profile
let profileCache: { data: UserProfileResponse; timestamp: number } | null = null;
let profileInFlight: Promise<UserProfileResponse> | null = null;
// Tune TTL as needed; this prevents burst calls while keeping data reasonably fresh
const PROFILE_TTL = 60_000; // 60 seconds

class UserApiService {
  async getUserProfile(forceRefresh = false): Promise<UserProfileResponse> {
    const now = Date.now();

    // Serve from cache when valid and not forced
    if (!forceRefresh && profileCache && now - profileCache.timestamp < PROFILE_TTL) {
      return profileCache.data;
    }

    // Deduplicate concurrent requests
    if (profileInFlight) {
      return profileInFlight;
    }

    profileInFlight = (async () => {
      const response = await fetch(`${API_BASE_URL}/users/user-profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as UserProfileResponse;

      // Update cache on success
      profileCache = {
        data: result,
        timestamp: Date.now(),
      };

      return result;
    })();

    try {
      const data = await profileInFlight;
      return data;
    } finally {
      // Always clear the in-flight promise when done
      profileInFlight = null;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  async getUserById(userId: string): Promise<GetUserByIdResponse> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  async searchUsers(query: string): Promise<SearchUsersResponse> {
    const response = await fetch(`${API_BASE_URL}/users/searchUsers?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }
}

export const userApiService = new UserApiService();
