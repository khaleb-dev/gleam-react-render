import { API_BASE_URL } from "@/config/env";

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
    profile_avatar?: string;
  };
  type:
    | "system"
    | "task"
    | "chat"
    | "alert"
    | "linkups"
    | "score"
    | "comment"
    | "mention"
    | "page_invite";
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
  type: "post" | "comment" | "task" | "linkup" | "score" | "other";
  reference_id: string;
  message: string;
  created_at: string;
}

export const getAllNotifications = async (): Promise<NotificationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get notifications error:", error);
    throw error;
  }
};

export const getAllActivities = async (): Promise<ActivityResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/activity/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get activities error:", error);
    throw error;
  }
};

export const markAsRead = async (
  notificationId: string
): Promise<{ message: string; data: ApiNotification; success: boolean }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Mark as read error:", error);
    throw error;
  }
};

export const acceptPageInvite = async (
  pageId: string
): Promise<{ message: string; data: any; success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/invite/accept`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_id: pageId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Accept page invite error:", error);
    throw error;
  }
};

export const rejectPageInvite = async (
  pageId: string
): Promise<{ message: string; data: any; success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/invite/reject`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_id: pageId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Reject page invite error:", error);
    throw error;
  }
};

export const sendPageInvite = async (
  userId: string,
  roleId: string,
  pageId: string
): Promise<{ message: string; data: any; success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/invite`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        user_id: userId, 
        role_id: roleId, 
        page_id: pageId 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Send page invite error:", error);
    throw error;
  }
};

export const sendBulkPageInvites = async (
  pageId: string,
  invites: Array<{ user_id: string; role_id: string }>
): Promise<{ message: string; data: any; success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/invite`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        page_id: pageId,
        invites: invites
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Send bulk page invites error:", error);
    throw error;
  }
};

export const checkInviteStatus = async (
  pageId: string
): Promise<{ message: string; data: { hasPending: boolean }; success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/${pageId}/pending-status`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Check invite status error:", error);
    throw error;
  }
};
