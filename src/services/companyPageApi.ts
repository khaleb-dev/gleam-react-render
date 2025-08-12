
import { API_BASE_URL } from "@/config/env";
import { handleApiErrors, handleNetworkError } from "@/utils/apiResponse";

export interface CompanyPageData {
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
  members: Array<{
    _id: string;
    page_id: string;
    user_id: {
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
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    status: string;
    joined_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
}

export interface GetCompanyPageResponse {
  message: string;
  data: CompanyPageData;
  success: boolean;
}

export interface UserPagesResponse {
  message: string;
  data: {
    count: number;
    pages: Array<{
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
    }>;
  };
  success: boolean;
}

export const getCompanyPage = async (identifier: string): Promise<GetCompanyPageResponse> => {
  try {
    const response = await fetch(`http://localhost:7000/api/v1/page/get-page?identifier=${identifier}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to fetch company page");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};

export const getUserPages = async (): Promise<UserPagesResponse> => {
  try {
    const response = await fetch(`http://localhost:7000/api/v1/page/get-user/pages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to fetch user pages");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};
