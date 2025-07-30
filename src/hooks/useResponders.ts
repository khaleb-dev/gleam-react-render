import { useState } from "react";
import { API_BASE_URL } from "@/config/env";

interface Responder {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  responder_id?: string;
  _id: string;
  availability_status: "available" | "busy";
}

export const useResponders = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [responders, setResponders] = useState<Responder[]>([]);

  const searchResponders = async (query: string) => {
    if (!query.trim()) {
      setResponders([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using credentials include instead

      const response = await fetch(
        `${API_BASE_URL}/users/search-responders?q=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        // Handle both single responder and array of responders
        const respondersData = Array.isArray(data.data)
          ? data.data
          : [data.data];
        setResponders(respondersData);
      } else {
        setResponders([]);
      }
    } catch (error) {
      console.error("Search responders error:", error);
      setResponders([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getResponderById = async (identifier: string) => {
    try {
      // Using credentials include instead

      const response = await fetch(
        `${API_BASE_URL}/users/get-responoder?identifier=${encodeURIComponent(
          identifier
        )}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Get responder error:", error);
      return null;
    }
  };

  return {
    responders,
    isSearching,
    searchResponders,
    getResponderById,
  };
};
