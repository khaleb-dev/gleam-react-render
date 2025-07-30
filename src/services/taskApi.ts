import { API_BASE_URL } from "../config/env";
import { Task, KeyNote } from "../types";
import { handleNetworkError } from "../utils/apiResponse";

export interface EstimateTaskRequest {
  title: string;
  assignment: string;
  subject: string;
  deadline: string;
  file_urls?: string[];
}

export interface EstimateTaskResponse {
  success: boolean;
  message: string;
  data?: {
    estimatedPrice: number;
    complexity: "easy" | "medium" | "hard";
  };
  errors?: { msg: string; field?: string }[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  subject: string;
  deadline: string;
  file_urls?: string[];
  key_notes?: string[];
  estimated_price: number;
  negotiated_price?: number;
  difficulty: "easy" | "medium" | "hard";
  responder_id?: string;
}

export interface CreateTaskResponse {
  success: boolean;
  message: string;
  data?: Task;
  errors?: { msg: string; field?: string }[];
}

export interface TaskHistoryQueryParams {
  title?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface TaskHistoryMeta {
  total: number;
  limit: number;
  page: number;
}

export interface TaskHistoryResponse {
  success: boolean;
  message: string;
  data?: {
    meta: TaskHistoryMeta;
    items: Record<string, Task[]>;
  };
  errors?: { msg: string; field?: string }[];
}

export interface RecentTasks {
  message: string;
  data?: Task[];
  success: boolean;
}

export interface DashboardStats {
  message: string;
  data?: {
    pending: number;
    active: number;
    completed: number;
  };
  success: boolean;
}

export interface SingleTaskResponse {
  success: boolean;
  message: string;
  data?: Task;
  errors?: { msg: string; field?: string }[];
}

export interface ApproveTaskResponse {
  success: boolean;
  message: string;
  data?: Task;
  errors?: { msg: string; field?: string }[];
}

// Chat interfaces
export interface ChatMessageSender {
  _id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "user" | "responder";
}

export interface ChatMessage {
  _id: string;
  task_id: string;
  sender_id: ChatMessageSender;
  sender_type: "user" | "users" | "responder";
  message: string;
  file_urls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  task_id: string;
  message: string;
  file_urls?: string[];
  sender_type: "users" | "responder";
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data?: ChatMessage;
}

export interface GetMessagesResponse {
  success: boolean;
  message: string;
  data?: ChatMessage[];
}

export interface DeleteMessageResponse {
  success: boolean;
  message: string;
  data: null;
}

// No longer using token-based auth - using credentials include

export const taskApi = {
  // Estimate task price
  estimateTaskPrice: async (
    taskData: EstimateTaskRequest
  ): Promise<EstimateTaskResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/estimate-payment-price`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        }
      );

      const data = await response.json();
      console.log("Estimate response:", data);
      return data;
    } catch (error) {
      console.error("Task estimate error:", error);
      return {
        success: false,
        message: "Failed to estimate task price. Please try again later.",
      };
    }
  },

  // Create a new task
  createTask: async (
    taskData: CreateTaskRequest
  ): Promise<CreateTaskResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Create task API error:", data);
        return {
          success: false,
          message: data.message || "Task creation failed due to server error.",
        };
      }

      return data;
    } catch (error) {
      console.error("Create task network error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  },

  // Get task history with optional filtering
  getTaskHistory: async (
    params?: TaskHistoryQueryParams
  ): Promise<TaskHistoryResponse> => {
    try {
      // Build query string from params
      let queryString = "";
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.title) queryParams.append("title", params.title);
        if (params.status) queryParams.append("status", params.status);
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.page) queryParams.append("page", params.page.toString());
        queryString = queryParams.toString();
      }

      const url = `${API_BASE_URL}/tasks/task-history${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Task history error:", error);
      return {
        success: false,
        message: "Failed to fetch task history. Please try again later.",
      };
    }
  },

  getTaskById: async (task_id: string): Promise<SingleTaskResponse> => {
    try {
      console.log("Fetching task with ID:", task_id);
      console.log("API_BASE_URL:", API_BASE_URL);

      const url = `${API_BASE_URL}/tasks/findOne?task_id=${task_id}`;
      console.log("Request URL:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Task data received:", data);
      return data;
    } catch (error) {
      console.error("Get task by id error:", error);
      handleNetworkError(error);
      return {
        success: false,
        message:
          "Failed to fetch task. Please check your connection and try again.",
      };
    }
  },

  getMostRecentTasks: async (): Promise<RecentTasks> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/most-recent-task`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Most recent tasks error:", error);
      return {
        success: false,
        message: "Failed to fetch most recent tasks. Please try again later.",
      };
    }
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/dashboard-analytics`,
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
      console.error("Dashboard stats error", error);
      return {
        success: false,
        message: "Failed to fetch dashboard stats. Please try again later.",
      };
    }
  },

  // Approve a submitted task
  approveSubmittedTask: async (
    task_id: string
  ): Promise<ApproveTaskResponse> => {
    try {
      const url = `${API_BASE_URL}/tasks/accept-submitted-task/${task_id}`;

      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Approve task error:", error);
      handleNetworkError(error);
      return {
        success: false,
        message: "Failed to approve task. Please try again later.",
      };
    }
  },

  // Send a chat message
  sendMessage: async (
    messageData: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/chat/send-message`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      return await response.json();
    } catch (error) {
      console.error("Send message error:", error);
      handleNetworkError(error);
      return {
        success: false,
        message: "Failed to send message. Please try again.",
      };
    }
  },

  // Get all chat messages for a task
  getMessages: async (taskId: string): Promise<GetMessagesResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/chat/${taskId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Get messages error:", error);
      handleNetworkError(error);
      return {
        success: false,
        message: "Failed to fetch messages. Please try again.",
      };
    }
  },

  // Delete a chat message
  deleteMessage: async (messageId: string): Promise<DeleteMessageResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/chat/delete/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Delete message error:", error);
      handleNetworkError(error);
      return {
        success: false,
        message: "Failed to delete message. Please try again.",
        data: null,
      };
    }
  },
};
