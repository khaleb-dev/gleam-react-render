import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_BASE_URL } from '@/config/env'

interface CreatePostPayload {
  title: string
  description: string
  images?: string[]
  videos?: string[]
  category: string
  tags?: string[]
}

interface CommentPayload {
  content: string
}

interface ScorePayload {
  score: number
}

interface FeedPost {
  _id: string
  user_id: string
  title: string
  description: string
  images: string[]
  videos?: string[]
  category: string
  tags: string[]
  total_score: number
  comments_count: number
  is_active: boolean
  created_at: string
  updated_at: string
  __v: number
  user: {
    first_name: string
    last_name: string
    email: string
    is_vetted: boolean
    responder_info: {
      job_title: string
      years_of_experience: number
      skills: string[]
      rank_status: {
        _id: string
        rank_name: string
        rank_color: string
        min_tasks_completed: number
        min_rating: number
        __v: number
        createdAt: string
        updatedAt: string
      }
      availability_status: string
    }
  }
  has_scored: boolean
}

interface ApiResponse {
  message: string
  data: FeedPost[]
  success: boolean
}

interface ScoreData {
  _id: string
  first_name: string
  last_name: string
  email: string
  roles: string[]
  is_vetted: boolean
  score: number
}

interface PeopleScoreResponse {
  message: string
  data: {
    users: ScoreData[]
    total_score: number
    total_people: number
  }
  success: boolean
}

interface FeedFilters {
  hashtag?: string
  search?: string
}

const getAuthToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1];
};

// Helper function to transform API post to component format (not used but kept for future reference)
const transformPost = (apiPost: FeedPost) => {
  const timeAgo = new Date(apiPost.created_at).toLocaleDateString()

  return {
    id: apiPost._id,
    title: apiPost.title,
    description: apiPost.description,
    images: apiPost.images,
    category: apiPost.category,
    tags: apiPost.tags,
    likes: apiPost.total_score,
    comments: apiPost.comments_count,
    timeAgo: timeAgo,
    user: {
      name: `${apiPost.user.first_name} ${apiPost.user.last_name}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(apiPost.user.first_name)}`,
      rating: 4.5,
      completedTasks: 0,
      rank: "intermediate" as const,
    }
  }
}

export const useFeed = () => {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  // Get feed posts with filters
  const getFeedPosts = (page: number = 1, limit: number = 10, filters?: FeedFilters) => {
    return useQuery({
      queryKey: ['feed', page, limit, filters],
      queryFn: async () => {
        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        
        if (filters?.hashtag) {
          params.append('hashtag', filters.hashtag)
        }
        
        if (filters?.search) {
          params.append('search', filters.search)
        }

        const response = await fetch(`${API_BASE_URL}/feed/all-posts?${params.toString()}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch feed')
        const apiResponse: ApiResponse = await response.json()

        // Sort posts by created_at in descending order to ensure consistent ordering
        const sortedPosts = apiResponse.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        // Return the data with sorted posts
        return {
          posts: sortedPosts,
          message: apiResponse.message,
          success: apiResponse.success
        }
      },
    })
  }

  // Get single post
  const getPost = (postId: string) => {
    return useQuery({
      queryKey: ['post', postId],
      queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/feed/${postId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch post')
        return response.json()
      },
    })
  }

  // Get post comments
  const getPostComments = (postId: string) => {
    return useQuery({
      queryKey: ['comments', postId],
      queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/feed/${postId}/comments`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch comments')
        const result = await response.json()
        return result.data || []
      },
    })
  }

  // Get people who scored a post
  const getPeopleScored = (postId: string) => {
    return useQuery({
      queryKey: ['people-scored', postId],
      queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/feed/get-people-scored/${postId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch people who scored')
        const result: PeopleScoreResponse = await response.json()
        return result.data
      },
    })
  }

  // Get suggested posts by user - with enabled option
  const getSuggestedPostsByUser = (postId: string, userId: string, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['suggested-posts', postId, userId],
      queryFn: async () => {
        if (!userId) return []
        const response = await fetch(`${API_BASE_URL}/feed/${postId}/${userId}/suggested-post-by-user`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch suggested posts')
        const result = await response.json()
        return result.data || []
      },
      enabled: options?.enabled !== false && !!userId && !!postId,
    })
  }

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`${API_BASE_URL}/feed/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to delete comment')
      return response.json()
    },
    onSuccess: (_, commentId) => {
      // Invalidate all comments queries to refresh the comments list
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/feed/create-post`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      setIsLoading(false)
      if (!response.ok) throw new Error('Failed to create post')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  // Score post mutation
  const scorePostMutation = useMutation({
    mutationFn: async ({ postId, payload }: { postId: string; payload: ScorePayload }) => {
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/score`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to score post')
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['people-scored', variables.postId] })
    },
  })

  // Unscore post mutation
  const unscorePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/unscore`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to unscore post')
      return response.json()
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['people-scored', postId] })
    },
  })

  // Like post mutation (keeping for backward compatibility)
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to like post')
      return response.json()
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  // Unlike post mutation (keeping for backward compatibility)
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/unlike`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to unlike post')
      return response.json()
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to delete post')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  // Comment on post mutation
  const commentPostMutation = useMutation({
    mutationFn: async ({ postId, payload }: { postId: string; payload: CommentPayload }) => {
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to comment on post')
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  return {
    getFeedPosts,
    getPost,
    getPostComments,
    getPeopleScored,
    getSuggestedPostsByUser,
    createPost: createPostMutation.mutateAsync,
    scorePost: scorePostMutation.mutateAsync,
    unscorePost: unscorePostMutation.mutateAsync,
    likePost: likePostMutation.mutateAsync,
    unlikePost: unlikePostMutation.mutateAsync,
    commentOnPost: commentPostMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    isLoading: isLoading || createPostMutation.isPending,
    isCreating: createPostMutation.isPending,
  }
}
