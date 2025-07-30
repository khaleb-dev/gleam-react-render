import { useState, useCallback } from "react";
import { toast } from "sonner";
import { API_BASE_URL, API_HOST_ADDRESS } from "@/config/env";

export interface UploadResponse {
  urls: string[];
}

export interface UploadError {
  message: string;
  details?: string;
}

const getAuthToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1];
};

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<string[] | null> => {
      if (!files || files.length === 0) {
        return [];
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch(
          `${API_HOST_ADDRESS}/api/upload/multiple`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data: UploadResponse = await response.json();

        if (data.urls && Array.isArray(data.urls)) {
          // Removed success toast - upload happens silently in background
          return data.urls;
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
    uploadFiles,
    isUploading,
    uploadError,
    clearError,
  };
};
