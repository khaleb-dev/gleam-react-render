import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

export interface CompanyPageRole {
  _id: string;
  role_name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CompanyPageRolesResponse {
  message: string;
  data: CompanyPageRole[];
  success: boolean;
}

export const useCompanyPageRoles = () => {
  return useQuery({
    queryKey: ['companyPageRoles'],
    queryFn: async (): Promise<CompanyPageRolesResponse> => {
      const response = await fetch(`${API_BASE_URL}/page/roles`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company page roles");
      }

      return response.json();
    },
  });
};