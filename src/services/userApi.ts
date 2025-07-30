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

class UserApiService {
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
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

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
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
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export const userApiService = new UserApiService();
