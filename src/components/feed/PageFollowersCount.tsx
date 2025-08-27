import React from 'react'
import { usePageFollowers } from '@/hooks/usePageFollowers'
import { Users } from 'lucide-react'

interface PageFollowersCountProps {
  pageId: string
  className?: string
}

export const PageFollowersCount: React.FC<PageFollowersCountProps> = ({ 
  pageId, 
  className = '' 
}) => {
  const { data: followersData, isLoading } = usePageFollowers(pageId)

  if (isLoading) {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        <Users className="h-3 w-3 inline mr-1" />
        Loading...
      </div>
    )
  }

  const followersCount = followersData?.followersCount || 0

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <Users className="h-3 w-3 inline mr-1" />
      {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
    </div>
  )
}