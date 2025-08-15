import { API_BASE_URL } from '@/config/env'
import { useQuery } from '@tanstack/react-query'

interface ChallengeUser {
  profile_avatar: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

interface ChallengeItem {
  _id: string
  user_id: string
  title: string
  description: string
  images: string[]
  videos: string[]
  category: string
  tags: string[]
  total_score: number
  comments_count: number
  is_active: boolean
  created_at: string
  updated_at: string
  __v: number
  user: ChallengeUser
}

interface ChallengeStatsResponse {
  message: string
  data: ChallengeItem[]
  success: boolean
}

export const useChallengeStats = (hashtag: string = 'beembyte_challenge', page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['challenge-stats', hashtag, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        hashtag,
        page: page.toString(),
        limit: limit.toString(),
      })

      const response = await fetch(`${API_BASE_URL}/feed/challenge-statistics?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch challenge statistics')

      const result: ChallengeStatsResponse = await response.json()
      return result.data
    },
  })
}
