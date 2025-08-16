
import React from 'react';
import { MembersList } from './MembersList';

interface MembersSidebarProps {
  pageId: string;
}

export const MembersSidebar = ({ pageId }: MembersSidebarProps) => {
  return (
    <div className="hidden lg:block w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4">
      <MembersList pageId={pageId} compact />
    </div>
  );
};
