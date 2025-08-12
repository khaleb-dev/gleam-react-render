import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '@/config/env'

interface Challenge {
  _id: string
  challenge_title: string
  description: string
  hashtag: string
  banner: string
  status: string
  number_of_participants: number
  createdAt: string
  updatedAt: string
  __v: number
}

interface ChallengeResponse {
  message: string
  data: Challenge
  success: boolean
}

export const useChallenge = () => {
  return useQuery({
    queryKey: ['challenge'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/feed/get-challenge`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch challenge')

      const result: ChallengeResponse = await response.json()
      return result.data
    },
  })
}
