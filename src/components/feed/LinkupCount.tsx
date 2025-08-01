import React from 'react';
import { useLinkup } from '@/hooks/useLinkup';

interface LinkupCountProps {
  userId: string;
  className?: string;
  showBothCounts?: boolean;
}

export const LinkupCount: React.FC<LinkupCountProps> = ({ userId, className = '', showBothCounts = false }) => {
  const { counts } = useLinkup(userId);

  if (showBothCounts) {
    return (
      <div className={className}>
        <div>{counts.linkedUpCount + counts.linkedMeCount}</div>
      </div>
    );
  }

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <span className="mr-2">{counts.linkedUpCount} linkups</span>
      <span>{counts.linkedMeCount} followers</span>
    </div>
  );
};
