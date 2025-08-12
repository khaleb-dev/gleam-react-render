import { useMutation } from "@tanstack/react-query";
import { createProduct, CreateProductRequest, CreateProductResponse } from "@/services/productApi";

export const useCreateProduct = () => {
  return useMutation<CreateProductResponse, Error, CreateProductRequest>({
    mutationFn: createProduct,
  });
};