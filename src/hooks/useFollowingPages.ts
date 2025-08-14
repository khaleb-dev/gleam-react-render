import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

export interface FollowingPage {
  _id: string;
  name: string;
  company_url: string;
  website: string;
  industry: string;
  industry_type: string;
  size: string;
  logo: string;
  tag_line: string;
  agreed_terms: boolean;
  admin_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  cover_logo?: string;
  about?: string;
}

interface FollowingPagesResponse {
  message: string;
  data: {
    count: number;
    pages: FollowingPage[];
  };
  success: boolean;
}

export const useFollowingPages = () => {
  return useQuery({
    queryKey: ["followingPages"],
    queryFn: async (): Promise<FollowingPagesResponse> => {
      const response = await fetch(`${API_BASE_URL}/page/following`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch following pages");
      }

      return response.json();
    },
  });
};