import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

export interface SuggestedPage {
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
}

interface SuggestedPagesResponse {
  message: string;
  data: {
    count: number;
    pages: SuggestedPage[];
  };
  success: boolean;
}

export const useSuggestedPages = () => {
  return useQuery({
    queryKey: ["suggestedPages"],
    queryFn: async (): Promise<SuggestedPagesResponse> => {
      const response = await fetch(`${API_BASE_URL}/page/suggested-pages`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggested pages");
      }

      return response.json();
    },
  });
};