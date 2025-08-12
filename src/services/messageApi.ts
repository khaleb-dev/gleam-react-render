// Message API service for handling messaging functionality
import { API_BASE_URL } from "../config/env";

export interface MessageUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  status: string;
  is_verified: boolean;
  profile_avatar?: string;
}

export interface InboxUser {
  _id: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  recipient: MessageUser;
}

export interface MessageData {
  _id: string;
  sender_id: any;
  recipient_id: string;
  content: string;
  audio_url?: string;
  image_urls?: string[];
  video_urls?: string[];
  file_urls?: string[];
  reply_to?: MessageData | string | null;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  // Message status indicators
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isDelivered?: boolean;
  deliveredAt?: string;
  readAt?: string;
}

export interface SendMessageRequest {
  recipient_id: string;
  content?: string;
  audio_url?: string;
  image_urls?: string[];
  video_urls?: string[];
  file_urls?: string[];
  reply_to?: string;
}

export interface UpdateMessageRequest {
  content?: string;
  audio_url?: string;
  image_urls?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { msg: string; field?: string }[];
}

class MessageApiService {
  // Get all user inbox
  async getInbox(): Promise<ApiResponse<InboxUser[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/message/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get inbox error:", error);
      return {
        success: false,
        message: "Failed to load inbox. Please try again later.",
      };
    }
  }

  // Get conversation with specific user
  async getConversation(
    recipientId: string
  ): Promise<ApiResponse<MessageData[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/message/conversation/${recipientId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get conversation error:", error);
      return {
        success: false,
        message: "Failed to load conversation. Please try again later.",
      };
    }
  }

  // Send a new message
  async sendMessage(
    data: SendMessageRequest
  ): Promise<ApiResponse<MessageData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/message/send`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Send message error:", error);
      return {
        success: false,
        message: "Failed to send message. Please try again later.",
      };
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/message/${messageId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete message error:", error);
      return {
        success: false,
        message: "Failed to delete message. Please try again later.",
      };
    }
  }

  // Update a message
  async updateMessage(
    messageId: string,
    data: UpdateMessageRequest
  ): Promise<ApiResponse<MessageData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/message/${messageId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Update message error:", error);
      return {
        success: false,
        message: "Failed to update message. Please try again later.",
      };
    }
  }

  // Mark messages as read
  async markAsRead(messageId: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/message/read/${messageId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Mark as read error:", error);
      return {
        success: false,
        message: "Failed to mark messages as read.",
      };
    }
  }
}

export const messageApi = new MessageApiService();
