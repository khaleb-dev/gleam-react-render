import React, { useState } from 'react';
import { useLinkup } from '@/hooks/useLinkup';
import { LinkupFollowersModal } from '@/components/profile/LinkupFollowersModal';

interface LinkupCountProps {
  userId: string;
  className?: string;
  showBothCounts?: boolean;
}

export const LinkupCount: React.FC<LinkupCountProps> = ({ userId, className = '', showBothCounts = false }) => {
  const { counts } = useLinkup(userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'linkups' | 'followers'>('linkups');

  if (showBothCounts) {
    return (
      <>
        <div className={className}>
          <div>{counts.linkedUpCount + counts.linkedMeCount}</div>
        </div>
        <LinkupFollowersModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={userId}
          initialTab={modalInitialTab}
        />
      </>
    );
  }

  return (
    <>
      <div className={`text-xs text-gray-500 ${className}`}>
        <span 
          className="mr-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => {
            setModalInitialTab('linkups');
            setModalOpen(true);
          }}
        >
          {counts.linkedUpCount} linkups
        </span>
        <span 
          className="cursor-pointer hover:text-primary transition-colors"
          onClick={() => {
            setModalInitialTab('followers');
            setModalOpen(true);
          }}
        >
          {counts.linkedMeCount} followers
        </span>
      </div>
      <LinkupFollowersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        initialTab={modalInitialTab}
      />
    </>
  );
};
