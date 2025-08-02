import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

interface SuggestedUser {
  profile_avatar: any;
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  roles: string[];
  is_verified: boolean;
  status: string;
  has_set_transaction_pin: boolean;
  is_vetted: boolean;
  createdAt: string;
  updatedAt: string;
  wallet_id: string;
  responder_id?: {
    rank_criteria: {
      tasks_completed: number;
      minimum_rating: number;
    };
    _id: string;
    user: string;
    responder_id: string;
    job_title: string;
    years_of_experience: number;
    portfolio_link: string;
    tools_technologies: Array<{
      _id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    }>;
    preferred_categories: Array<{
      _id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    }>;
    preferred_callDate: string;
    preferred_callTime: string;
    call_platform: string;
    resume: string;
    country: string;
    state: string;
    city: string;
    bio: string;
    skills: string[];
    availability_status: string;
    createdAt: string;
    updatedAt: string;
    rank_status: {
      _id: string;
      rank_name: string;
      rank_color: string;
      min_tasks_completed: number;
      min_rating: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  user_id: string;
}

interface SuggestedUsersResponse {
  message: string;
  data: SuggestedUser[];
  success: boolean;
}

export const useSuggestedUsers = (limit: number = 10, skip: number = 0, accumulate: boolean = false) => {
  return useQuery({
    queryKey: ["suggestedUsers", limit, skip, accumulate],
    queryFn: async (): Promise<SuggestedUsersResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/users/suggested-users?limit=${limit}&skip=${skip}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggested users");
      }

      return response.json();
    },
    select: accumulate ? (data) => {
      // For accumulation, we need to manage this at component level
      return data;
    } : undefined,
  });
};
