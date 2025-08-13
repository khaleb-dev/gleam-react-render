import { API_BASE_URL } from "@/config/env";
import { handleApiErrors, handleNetworkError } from "@/utils/apiResponse";

export interface CreateProductRequest {
  page_id: string;
  name: string;
  description: string;
  percentage: number;
  is_live: boolean;
  logo: string;
}

export interface CreateProductResponse {
  message: string;
  data: {
    page_id: string;
    name: string;
    description: string;
    percentage: number;
    is_live: boolean;
    logo: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  success: boolean;
}

export interface Product {
  _id: string;
  page_id: string;
  name: string;
  description: string;
  percentage: number;
  is_live: boolean;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetProductsResponse {
  message: string;
  data: {
    count: number;
    products: Product[];
  };
  success: boolean;
}

export const createProduct = async (data: CreateProductRequest): Promise<CreateProductResponse> => {
  try {
    const response = await fetch(`http://localhost:7000/api/v1/page/create-product`, {
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
      throw new Error(result.message || "Failed to create product");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};

export const getProducts = async (pageId: string): Promise<GetProductsResponse> => {
  try {
    const response = await fetch(`http://localhost:7000/api/v1/page/get-products?page_id=${pageId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      handleApiErrors(result);
      throw new Error(result.message || "Failed to fetch products");
    }

    return result;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
};