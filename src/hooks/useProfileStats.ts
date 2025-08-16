
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

interface ProfileStats {
  totalProfileViews: number;
  totalPosts: number;
}

interface ProfileStatsResponse {
  message: string;
  data: ProfileStats;
  success: boolean;
}

export const useProfileStats = (userId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["profileStats", userId],
    queryFn: async (): Promise<ProfileStatsResponse> => {
      const response = await fetch(`${API_BASE_URL}/users/profile-stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile stats");
      }

      return response.json();
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
