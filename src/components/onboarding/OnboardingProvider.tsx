import React, { useEffect, useState } from 'react';
import { OnboardingModal } from './OnboardingModal';
import { useAppContext } from '@/context/AppContext';

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<{ 
    isFirstTime: boolean; 
    needsAvatar: boolean; 
  } | null>(null);
  const { user, updateUserProfile } = useAppContext();

  useEffect(() => {
    // Check if onboarding should be shown
    const onboardingInfo = sessionStorage.getItem('showOnboarding');
    if (onboardingInfo && user) {
      try {
        const data = JSON.parse(onboardingInfo);
        setOnboardingData(data);
        setShowOnboarding(true);
        // Clear the flag from sessionStorage
        sessionStorage.removeItem('showOnboarding');
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
        sessionStorage.removeItem('showOnboarding');
      }
    }
  }, [user]);

  const handleOnboardingComplete = (updatedUser: any) => {
    // Use updateUserProfile instead of setUser to properly merge updates
    updateUserProfile(updatedUser);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    setOnboardingData(null);
  };

  return (
    <>
      {children}
      {showOnboarding && user && onboardingData && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
          user={user}
          isFirstTime={onboardingData.isFirstTime}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
};