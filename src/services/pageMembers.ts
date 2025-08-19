import { API_BASE_URL } from "@/config/env";
import { handleApiErrors, handleNetworkError } from "@/utils/apiResponse";

export interface PageMember {
  [x: string]: any;
  _id: string;
  page_id: string;
  user_id: {
    profile_avatar: string;
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  role_id: {
    _id: string;
    role_name: string;
    description: string;
    permissions: string[];
  };
  status: string;
  joined_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PageMembersResponse {
  message: string;
  data: {
    count: number;
    members: PageMember[];
  };
  success: boolean;
}

export const getPageMembers = async (
  pageId: string
): Promise<PageMembersResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/${pageId}/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to fetch page members");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};

export interface PendingPageMember {
  _id: string;
  page_id: string;
  user_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_avatar?: string;
  };
  role_id: {
    _id: string;
    role_name: string;
  };
  status: string;
  invited_by: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  joined_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PendingPageMembersResponse {
  message: string;
  data: {
    count: number;
    members: PendingPageMember[];
  };
  success: boolean;
}

export const getPendingPageMembers = async (
  pageId: string
): Promise<PendingPageMembersResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/page/${pageId}/pending-members`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to fetch pending page members");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};
