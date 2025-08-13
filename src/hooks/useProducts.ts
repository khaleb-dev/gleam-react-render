import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productApi";

export const useProducts = (pageId: string) => {
  return useQuery({
    queryKey: ['products', pageId],
    queryFn: () => getProducts(pageId),
    enabled: !!pageId,
  });
};