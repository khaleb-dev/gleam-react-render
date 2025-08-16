
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

// Store viewed profiles in memory to avoid duplicate calls
const viewedProfiles = new Set<string>();

export const useProfileView = () => {
  const queryClient = useQueryClient();

  const viewProfile = useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      // Don't call API if already viewed in this session
      if (viewedProfiles.has(userId)) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/view-profile/${userId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to record profile view");
      }

      // Mark as viewed to prevent duplicate calls
      viewedProfiles.add(userId);
    },
    onSuccess: (_, userId) => {
      // Only invalidate profile stats for the specific user after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["profileStats", userId] });
      }, 1000);
    },
  });

  return {
    viewProfile: viewProfile.mutate,
    isViewing: viewProfile.isPending,
  };
};
