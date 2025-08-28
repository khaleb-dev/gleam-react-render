import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '@/config/env'

interface PageStatsResponse {
  message: string
  data: {
    posts: number
    products: number
    team_members: number
    followers: number
    total_score: number
  }
  success: boolean
}

export const usePageFollowers = (pageId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['page-stats', pageId],
    queryFn: async () => {
      if (!pageId) return { followersCount: 0 }
      
      const response = await fetch(`${API_BASE_URL}/page/stats/${pageId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        // If endpoint doesn't exist, return zero count
        if (response.status === 404) {
          return { followersCount: 0 }
        }
        throw new Error('Failed to fetch page stats')
      }
      
      const result: PageStatsResponse = await response.json()
      return { followersCount: result.data.followers }
    },
    enabled: options?.enabled !== false && !!pageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}