import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

interface UserFeedPost {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  images: string[];
  videos: string[];
  category: string;
  tags: string[];
  total_score: number;
  comments_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
}

interface UserFeedResponse {
  message: string;
  data: UserFeedPost[];
  success: boolean;
}

export const useUserFeed = (userId: string, limit: number = 3) => {
  return useQuery({
    queryKey: ["userFeed", userId, limit],
    queryFn: async (): Promise<UserFeedResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/feed/most-recent-feed/${userId}/${limit}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user feed");
      }

      return response.json();
    },
    enabled: !!userId,
  });
};
