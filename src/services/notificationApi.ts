import { API_BASE_URL } from '@/config/env';

export interface NotificationResponse {
  message: string;
  data: ApiNotification[];
  success: boolean;
}

export interface ApiNotification {
  _id: string;
  user_id: string;
  sender_id?: {
    _id: string;
    first_name: string;
    last_name: string;
    user_id: string;
  };
  type: 'system' | 'task' | 'chat' | 'alert' | 'linkups' | 'score' | 'comment';
  path?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  reference_id?: any;
}

export interface ActivityResponse {
  message: string;
  data: Activity[];
  success: boolean;
}

export interface Activity {
  _id: string;
  user_id: string;
  type: 'post' | 'comment' | 'task' | 'linkup' | 'score' | 'other';
  reference_id: string;
  message: string;
  created_at: string;
}

export const getAllNotifications = async (): Promise<NotificationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/all`, {
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
    console.error('Get notifications error:', error);
    throw error;
  }
};

export const getAllActivities = async (): Promise<ActivityResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/activity/all`, {
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
    console.error('Get activities error:', error);
    throw error;
  }
};

export const markAsRead = async (notificationId: string): Promise<{ message: string; data: ApiNotification; success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
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
    console.error('Mark as read error:', error);
    throw error;
  }
};