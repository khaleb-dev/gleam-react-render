
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

interface CompanyPageStats {
  posts: number;
  products: number;
  team_members: number;
  total_score: number;
}

interface CompanyPageStatsResponse {
  message: string;
  data: CompanyPageStats;
  success: boolean;
}

export const useCompanyPageStats = (pageId: string) => {
  return useQuery({
    queryKey: ["companyPageStats", pageId],
    queryFn: async (): Promise<CompanyPageStatsResponse> => {
      const response = await fetch(`${API_BASE_URL}/page/stats/${pageId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company page stats");
      }

      return response.json();
    },
    enabled: !!pageId,
  });
};
