import { useState, useEffect } from 'react';
import { acceptPageInvite, rejectPageInvite, checkInviteStatus } from '@/services/notificationApi';
import { toast } from 'sonner';

export const usePageInvite = (pageId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingInvite, setHasPendingInvite] = useState<boolean | null>(null);

  const checkInviteValidity = async () => {
    if (!pageId) return;
    
    try {
      const response = await checkInviteStatus(pageId);
      if (response.success) {
        setHasPendingInvite(response.data.hasPending);
      }
    } catch (error) {
      console.error('Error checking invite status:', error);
      setHasPendingInvite(false);
    }
  };

  const acceptInvite = async () => {
    if (!pageId) return;
    
    try {
      setIsLoading(true);
      const response = await acceptPageInvite(pageId);
      if (response.success) {
        toast.success('Invite accepted successfully');
        setHasPendingInvite(false);
        return true;
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Failed to accept invite');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectInvite = async () => {
    if (!pageId) return;
    
    try {
      setIsLoading(true);
      const response = await rejectPageInvite(pageId);
      if (response.success) {
        toast.success('Invite rejected');
        setHasPendingInvite(false);
        return true;
      }
    } catch (error) {
      console.error('Error rejecting invite:', error);
      toast.error('Failed to reject invite');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkInviteValidity();
  }, [pageId]);

  return {
    isLoading,
    hasPendingInvite,
    acceptInvite,
    rejectInvite,
    checkInviteValidity,
  };
};