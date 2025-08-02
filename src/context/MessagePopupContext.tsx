import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  profile_avatar?: string;
  isOnline?: boolean;
}

interface PopupState {
  user: User;
  isMinimized: boolean;
}

interface MessagePopupContextType {
  popups: PopupState[];
  openPopup: (user: User) => void;
  closePopup: (userId: string) => void;
  toggleMinimize: (userId: string) => void;
}

const MessagePopupContext = createContext<MessagePopupContextType | undefined>(undefined);

export const useMessagePopup = () => {
  const context = useContext(MessagePopupContext);
  if (!context) {
    throw new Error('useMessagePopup must be used within a MessagePopupProvider');
  }
  return context;
};

interface MessagePopupProviderProps {
  children: ReactNode;
}

export const MessagePopupProvider: React.FC<MessagePopupProviderProps> = ({ children }) => {
  const [popups, setPopups] = useState<PopupState[]>(() => {
    // Load popups from localStorage on initialization
    try {
      const saved = localStorage.getItem('messagePopups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const openPopup = (user: User) => {
    setPopups(prev => {
      // Check if popup already exists
      const existingIndex = prev.findIndex(p => p.user.user_id === user.user_id);
      
      if (existingIndex !== -1) {
        // If exists, just maximize it
        const updated = [...prev];
        updated[existingIndex].isMinimized = false;
        localStorage.setItem('messagePopups', JSON.stringify(updated));
        return updated;
      }
      
      // If we have 3 popups, remove the oldest one
      const newPopups = prev.length >= 3 ? prev.slice(1) : prev;
      const updatedPopups = [...newPopups, { user, isMinimized: false }];
      localStorage.setItem('messagePopups', JSON.stringify(updatedPopups));
      return updatedPopups;
    });
  };

  const closePopup = (userId: string) => {
    setPopups(prev => {
      const updated = prev.filter(p => p.user.user_id !== userId);
      localStorage.setItem('messagePopups', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleMinimize = (userId: string) => {
    setPopups(prev => {
      const updated = prev.map(p => 
        p.user.user_id === userId 
          ? { ...p, isMinimized: !p.isMinimized }
          : p
      );
      localStorage.setItem('messagePopups', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <MessagePopupContext.Provider value={{ popups, openPopup, closePopup, toggleMinimize }}>
      {children}
    </MessagePopupContext.Provider>
  );
};