import { API_BASE_URL } from "@/config/env";
import { handleApiErrors, handleNetworkError } from "@/utils/apiResponse";

export interface FollowPageResponse {
  message: string;
  data: {
    user_id: string;
    page_id: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  success: boolean;
}

export interface UnfollowPageResponse {
  message: string;
  data: null;
  success: boolean;
}

export interface FollowStatusResponse {
  message: string;
  data: {
    isFollowing: boolean;
  };
  success: boolean;
}

export const followCompanyPage = async (
  pageId: string
): Promise<FollowPageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/follow/${pageId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to follow company page");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};

export const unfollowCompanyPage = async (
  pageId: string
): Promise<UnfollowPageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/unfollow/${pageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to unfollow company page");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};

export const getFollowStatus = async (
  pageId: string
): Promise<FollowStatusResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/page/is-following/${pageId}`,
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
      throw new Error(result.message || "Failed to get follow status");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};
