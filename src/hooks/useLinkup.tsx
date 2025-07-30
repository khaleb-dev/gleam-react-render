import { useState, useEffect } from 'react';
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

export const useLinkup = (userId: string) => {
  const [status, setStatus] = useState<LinkupStatus>({ isLinkedUp: false, isMutual: false, isLoading: true });
  const [counts, setCounts] = useState<LinkupCount>({ linkedUpCount: 0, linkedMeCount: 0 });
  const { loggedInUser } = useAuth();

  useEffect(() => {
    if (userId) {
      checkLinkupStatus();
      getLinkupCounts();
    }
  }, [userId]);

  const checkLinkupStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));

      const [linkupResponse, mutualResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users/check-linkup/${userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`${API_BASE_URL}/users/ismutual-linkup/${userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      const linkupData = await linkupResponse.json();
      const mutualData = await mutualResponse.json();

      if (linkupData.success && mutualData.success) {
        setStatus({
          isLinkedUp: linkupData.data.isLinkUp,
          isMutual: mutualData.data.isMutualLink,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error checking linkup status:', error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getLinkupCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/linkup/count/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setCounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching linkup counts:', error);
    }
  };

  const linkup = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/linkup/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        await checkLinkupStatus();
        await getLinkupCounts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error linking up:', error);
      return false;
    }
  };

  const unlinkup = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/unlinkup/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        await checkLinkupStatus();
        await getLinkupCounts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unlinking:', error);
      return false;
    }
  };

  return {
    status,
    counts,
    linkup,
    unlinkup,
    refreshStatus: checkLinkupStatus,
    refreshCounts: getLinkupCounts
  };
};
