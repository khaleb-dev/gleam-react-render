import React from 'react';
import { useLinkup } from '@/hooks/useLinkup';

interface LinkupCountProps {
  userId: string;
  className?: string;
}

export const LinkupCount: React.FC<LinkupCountProps> = ({ userId, className = '' }) => {
  const { counts } = useLinkup(userId);

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      {counts.linkedUpCount + counts.linkedMeCount} linkups
    </div>
  );
};
