
import { useMutation } from "@tanstack/react-query";
import { createCompanyPage, CreateCompanyPageRequest, CreateCompanyPageResponse } from "@/services/companyApi";

export const useCreateCompanyPage = () => {
  return useMutation<CreateCompanyPageResponse, Error, CreateCompanyPageRequest>({
    mutationFn: createCompanyPage,
  });
};
