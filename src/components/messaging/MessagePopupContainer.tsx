import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessagePopup } from './MessagePopup';
import { useMessagePopup } from '@/context/MessagePopupContext';

export const MessagePopupContainer: React.FC = () => {
  const location = useLocation();
  const { popups, closePopup, toggleMinimize } = useMessagePopup();

  // Don't show popups on the Messages page
  if (location.pathname === '/messages') {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-4 flex gap-4 z-50 items-end">
      {popups.map((popup) => (
        <div key={popup.user.user_id}>
          <MessagePopup
            user={popup.user}
            onClose={() => closePopup(popup.user.user_id)}
            onMinimize={() => toggleMinimize(popup.user.user_id)}
            isMinimized={popup.isMinimized}
          />
        </div>
      ))}
    </div>
  );
};