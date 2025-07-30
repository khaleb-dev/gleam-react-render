import { toast } from "sonner";

export const handleApiErrors = (response: {
  message?: string;
  errors?: { msg: string; field?: string }[];
}) => {
  if (response.errors && Array.isArray(response.errors)) {
    response.errors.forEach((err) => {
      toast.error(err.msg);
    });
  } else {
    toast.error(response.message || "Something went wrong. Please try again.");
  }
};

export const handleNetworkError = (error: unknown) => {
  console.error('Network error:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('NetworkError') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed')) {
      toast.error('Network connection issue. Please check your internet connection.');
    } else if (error.message.includes('WebSocket')) {
      toast.error('Live connection failed. Some features may be limited.');
    } else {
      toast.error(`Error: ${error.message}`);
    }
  } else {
    toast.error('An unexpected error occurred. Please try again later.');
  }
};
