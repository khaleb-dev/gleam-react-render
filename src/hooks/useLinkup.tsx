
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '@/config/env';

interface LinkupStatus {
  isLinkedUp: boolean;
  isMutual: boolean;
  isLoading: boolean;
}

interface LinkupCount {
  linkedUpCount: number;
  linkedMeCount: number;
}

interface LinkupData {
  status: LinkupStatus;
  counts: LinkupCount;
}

const fetchLinkupData = async (userId: string): Promise<LinkupData> => {
  const [linkupResponse, mutualResponse, countsResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/users/check-linkup/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }),
    fetch(`${API_BASE_URL}/users/ismutual-linkup/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }),
    fetch(`${API_BASE_URL}/users/linkup/count/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
  ]);

  const [linkupData, mutualData, countsData] = await Promise.all([
    linkupResponse.json(),
    mutualResponse.json(),
    countsResponse.json()
  ]);

  return {
    status: {
      isLinkedUp: linkupData.success ? linkupData.data.isLinkUp : false,
      isMutual: mutualData.success ? mutualData.data.isMutualLink : false,
      isLoading: false
    },
    counts: countsData.success ? countsData.data : { linkedUpCount: 0, linkedMeCount: 0 }
  };
};

export const useLinkup = (userId: string) => {
  const { loggedInUser } = useAuth();
  const queryClient = useQueryClient();

  // Use React Query to fetch and cache linkup data
  const { data, isLoading, error } = useQuery({
    queryKey: ['linkup', userId],
    queryFn: () => fetchLinkupData(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const linkupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users/linkup/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch linkup data
      queryClient.invalidateQueries({ queryKey: ['linkup', userId] });
    },
  });

  const unlinkupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users/unlinkup/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch linkup data
      queryClient.invalidateQueries({ queryKey: ['linkup', userId] });
    },
  });

  const linkup = async () => {
    try {
      const result = await linkupMutation.mutateAsync();
      return result.success;
    } catch (error) {
      console.error('Error linking up:', error);
      return false;
    }
  };

  const unlinkup = async () => {
    try {
      const result = await unlinkupMutation.mutateAsync();
      return result.success;
    } catch (error) {
      console.error('Error unlinking:', error);
      return false;
    }
  };

  const refreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['linkup', userId] });
  };

  const refreshCounts = refreshStatus; // Same as refreshStatus now

  return {
    status: data?.status || { isLinkedUp: false, isMutual: false, isLoading: isLoading },
    counts: data?.counts || { linkedUpCount: 0, linkedMeCount: 0 },
    linkup,
    unlinkup,
    refreshStatus,
    refreshCounts,
    isLoading: isLoading || linkupMutation.isPending || unlinkupMutation.isPending,
  };
};
