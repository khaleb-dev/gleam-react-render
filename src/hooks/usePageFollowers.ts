import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '@/config/env'

interface PageFollowersResponse {
  message: string
  data: {
    followers: any[]
    followersCount: number
  }
  success: boolean
}

export const usePageFollowers = (pageId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['page-followers', pageId],
    queryFn: async () => {
      if (!pageId) return { followers: [], followersCount: 0 }
      
      const response = await fetch(`${API_BASE_URL}/page/followers/${pageId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        // If endpoint doesn't exist, return zero count
        if (response.status === 404) {
          return { followers: [], followersCount: 0 }
        }
        throw new Error('Failed to fetch page followers')
      }
      
      const result: PageFollowersResponse = await response.json()
      return result.data
    },
    enabled: options?.enabled !== false && !!pageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}