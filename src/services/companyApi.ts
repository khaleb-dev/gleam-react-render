import { API_BASE_URL } from "@/config/env";
import { handleApiErrors, handleNetworkError } from "@/utils/apiResponse";

export interface CreateCompanyPageRequest {
  name: string;
  company_url: string;
  website: string;
  industry: string;
  industry_type: string;
  size: string;
  logo: string;
  page_image: string;
  tag_line: string;
  agreed_terms: boolean;
}

export interface CreateCompanyPageResponse {
  message: string;
  data: {
    name: string;
    company_url: string;
    website: string;
    industry: string;
    industry_type: string;
    size: string;
    logo: string;
    page_image: string;
    tag_line: string;
    agreed_terms: boolean;
    admin_id: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  success: boolean;
}

export const createCompanyPage = async (
  data: CreateCompanyPageRequest
): Promise<CreateCompanyPageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/page/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to create company page");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};
