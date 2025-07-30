import { useState, useCallback } from "react";
import { toast } from "sonner";
import { API_HOST_ADDRESS } from "@/config/env";

export interface SingleUploadResponse {
  url: string;
}

export interface SingleUploadError {
  message: string;
  details?: string;
}

export const useSingleFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file) {
        return null;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${API_HOST_ADDRESS}/api/upload/single`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data: SingleUploadResponse = await response.json();

        if (data.url) {
          return data.url;
        } else {
          throw new Error("Invalid response format from upload service");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploadError(errorMessage);
        toast.error(`File upload failed: ${errorMessage}`);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    uploadError,
    clearError,
  };
};