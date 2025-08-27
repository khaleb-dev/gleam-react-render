"use client"
import React, { useState } from "react"
import { FeedCard } from "@/components/feed/FeedCard"
import { CreatePostCard } from "@/components/feed/CreatePostCard"
import { ChallengeCard } from "@/components/feed/ChallengeCard"
import { WeeklyTopResponders } from "@/components/feed/WeeklyTopResponders"
import { TrendingCategories } from "@/components/feed/TrendingCategories"
import { SuggestedUsers } from "@/components/feed/SuggestedUsers"
import { MobileSuggestedUsers } from "@/components/feed/MobileSuggestedUsers"
import { TopWeeklyChallengers } from "@/components/feed/TopWeeklyChallengers"
import { SuggestedPagesCard } from "@/components/feed/SuggestedPagesCard"
import { SuggestedUsersCarousel } from "@/components/feed/SuggestedUsersCarousel"
import { SuggestedPagesCarousel } from "@/components/feed/SuggestedPagesCarousel"
import { FollowingPagesCard } from "@/components/feed/FollowingPagesCard"
import { FeedActionButton } from "@/components/feed/FeedActionButton"
import { useAuth } from "@/hooks/useAuth"
import { useFeed } from "@/hooks/useFeed"
import { useDebounce } from "@/hooks/useDebounce"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "react-router-dom"
import type { User } from "@/types"
import { ProfileStatsCard } from "@/components/profile/ProfileStatsCard"
import { UserPagesCard } from "@/components/feed/UserPagesCard"

interface FeedPost {
  _id: string
  user_id: string
  user_type: 'user' | 'Page'
  created_by?: string
  visibility: string
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
  owner: {
    type: 'user' | 'page'
    // For users
    first_name?: string
    last_name?: string
    // For pages
    name?: string
    company_url?: string
    website?: string
    industry?: string
    logo?: string
  }
  has_scored: boolean
  people_score_count: number
}

const Feed = () => {
  const { loggedInUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { getFeedPosts, createPost, likePost, unlikePost, commentOnPost, deleteComment, deletePost } = useFeed()

  // Get hashtag from URL params
  const [searchParams] = useSearchParams()
  const hashtagFromUrl = searchParams.get('hashtag')

  // Debounce search query to avoid too many requests
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Build filters object with debounced search
  const filters = React.useMemo(() => {
    const filterObj: { hashtag?: string; search?: string } = {}

    if (hashtagFromUrl) {
      filterObj.hashtag = hashtagFromUrl
    }

    if (debouncedSearchQuery.trim()) {
      filterObj.search = debouncedSearchQuery.trim()
    }

    return Object.keys(filterObj).length > 0 ? filterObj : undefined
  }, [hashtagFromUrl, debouncedSearchQuery])

  // Fetch feed posts from API with filters
  const { data: feedData, isLoading: feedLoading, error: feedError } = getFeedPosts(1, 50, filters)

  React.useEffect(() => {
    let isMounted = true
    let hasFetched = false

    const getUser = async () => {
      if (!hasFetched) {
        hasFetched = true
        try {
          const userData = await loggedInUser()
          if (userData && isMounted) {
            setUser(userData)
          }
        } catch (error) {
          console.error("Error fetching user:", error)
          setUser(null)
        }
      }
    }
    getUser()
    return () => {
      isMounted = false
    }
  }, [])

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInMs = now.getTime() - postDate.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `${diffInDays}d ago`
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}m ago`
    }
  }

  // Use API data and filter only active posts with proper null checks
  const postsToShow = React.useMemo(() => {
    if (!feedData?.posts || !Array.isArray(feedData.posts)) {
      return []
    }
    return feedData.posts.filter((post: any) => {
      // Ensure post exists and has required properties
      return post && post._id && post.is_active !== false
    })
  }, [feedData])

  // Since we're now doing server-side filtering, we don't need client-side filtering for search
  // but we still filter by tab categories
  const filteredPosts = React.useMemo(() => {
    return postsToShow.filter((post: any) => {
      if (!post) return false

      // Filter by active tab
      if (activeTab === "design") {
        const tags = Array.isArray(post.tags) ? post.tags : []
        return tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes('project'))
      } else if (activeTab === "development") {
        const tags = Array.isArray(post.tags) ? post.tags : []
        return tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes('job'))
      }

      return true // For "all" and "trending" tabs, show all posts
    })
  }, [postsToShow, activeTab])

  // Sort for trending tab
  const sortedPosts = React.useMemo(() => {
    if (activeTab === "trending") {
      return [...filteredPosts].sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    }
    return filteredPosts
  }, [filteredPosts, activeTab])

  const handlePostCreate = async (postData: any) => {
    try {
      await createPost(postData)
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const handleLike = async (postId: string) => {
    if (!postId) return
    try {
      await likePost(postId)
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleUnlike = async (postId: string) => {
    if (!postId) return
    try {
      await unlikePost(postId)
    } catch (error) {
      console.error("Error unliking post:", error)
    }
  }

  const handleComment = async (postId: string, content: string) => {
    if (!postId || !content) return
    try {
      await commentOnPost({ postId, payload: { content } })
    } catch (error) {
      console.error("Error commenting on post:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!commentId) return
    try {
      await deleteComment(commentId)
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!postId) return
    try {
      await deletePost(postId)
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const handleActionButtonClick = () => {
    setShowCreateModal(true)
  }

  if (feedLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="pt-0 p-0">
          <main className="flex-grow">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">Loading posts...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (feedError) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="pt-0 p-0">
          <main className="flex-grow">
            <div className="text-center p-8">
              <p className="text-sm text-red-500">Error loading posts: {feedError.message}</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Add top padding to account for fixed header */}
      <div className="pt-4 p-0">
        <main className="flex-grow">
          {/* Main Content - Three Column Layout on Large Screens */}
          <div className="w-full lg:max-w-8xl lg:mx-auto lg:flex lg:gap-6 lg:px-4 lg:items-start">

            {/* Left Sidebar - Profile Stats and Top Responders (Only show on large screens) */}
            <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:pt-4">
              <div className="space-y-4">
                <ProfileStatsCard user={user} />
                <UserPagesCard />
                <ChallengeCard />
                <WeeklyTopResponders />
              </div>
            </div>

            {/* Main Feed - Fixed width for large screens */}
            <div className="w-full lg:w-[600px] lg:flex-shrink-0 lg:pt-4">

              {/* Create Post Card - only show if logged in */}
              {user && (
                <div className="w-full px-4 lg:px-0 py-0">
                  <CreatePostCard user={user} onPostCreate={handlePostCreate} />
                </div>
              )}

              {/* Filter Tabs */}
              <div className="w-full px-0 sm:px-4 lg:px-0 mb-3 mt-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 h-8 mx-6 sm:mx-8 lg:mx-0">
                    <TabsTrigger value="all" className="text-xs">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="design" className="text-xs">
                      Projects
                    </TabsTrigger>
                    <TabsTrigger value="development" className="text-xs">
                      Jobs
                    </TabsTrigger>
                    <TabsTrigger value="trending" className="text-xs">
                      <TrendingUp className="h-3 w-3" />
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab content sections */}
                  <TabsContent value="all" className="mt-3 space-y-0">
                    {sortedPosts.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchQuery || hashtagFromUrl
                            ? "Try adjusting your search or hashtag filter"
                            : "Be the first to share something with the community!"}
                        </p>
                      </div>
                    ) : (
                      sortedPosts.map((post: FeedPost, index: number) => (
                        <React.Fragment key={post._id}>
                          <FeedCard
                            post={post}
                            onLike={() => handleLike(post._id)}
                            onUnlike={() => handleUnlike(post._id)}
                            onComment={(content) => handleComment(post._id, content)}
                            onDeleteComment={handleDeleteComment}
                            onDeletePost={handleDeletePost}
                            initialLiked={post.has_scored}
                          />
                          {/* Show suggested users after 4th post */}
                          {index === 3 && <SuggestedUsersCarousel />}
                          {/* Show suggested pages after 8th post */}
                          {index === 7 && <SuggestedPagesCarousel />}
                          {/* Show suggested users again after 15th post */}
                          {index === 14 && <SuggestedUsersCarousel />}
                          {/* Show suggested pages again after 22nd post */}
                          {index === 21 && <SuggestedPagesCarousel />}
                        </React.Fragment>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="design" className="mt-3 space-y-0">
                    {sortedPosts.map((post: FeedPost, index: number) => (
                      <React.Fragment key={post._id}>
                        <FeedCard
                          post={post}
                          onLike={() => handleLike(post._id)}
                          onUnlike={() => handleUnlike(post._id)}
                          onComment={(content) => handleComment(post._id, content)}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          initialLiked={post.has_scored}
                        />
                        {/* Show suggested users after 4th post */}
                        {index === 3 && <SuggestedUsersCarousel />}
                        {/* Show suggested pages after 8th post */}
                        {index === 7 && <SuggestedPagesCarousel />}
                        {/* Show suggested users again after 15th post */}
                        {index === 14 && <SuggestedUsersCarousel />}
                        {/* Show suggested pages again after 22nd post */}
                        {index === 21 && <SuggestedPagesCarousel />}
                      </React.Fragment>
                    ))}
                  </TabsContent>

                  <TabsContent value="development" className="mt-3 space-y-0">
                    {sortedPosts.map((post: FeedPost, index: number) => (
                      <React.Fragment key={post._id}>
                        <FeedCard
                          post={post}
                          onLike={() => handleLike(post._id)}
                          onUnlike={() => handleUnlike(post._id)}
                          onComment={(content) => handleComment(post._id, content)}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          initialLiked={post.has_scored}
                        />
                        {/* Show suggested users after 4th post */}
                        {index === 3 && <SuggestedUsersCarousel />}
                        {/* Show suggested pages after 8th post */}
                        {index === 7 && <SuggestedPagesCarousel />}
                        {/* Show suggested users again after 15th post */}
                        {index === 14 && <SuggestedUsersCarousel />}
                        {/* Show suggested pages again after 22nd post */}
                        {index === 21 && <SuggestedPagesCarousel />}
                      </React.Fragment>
                    ))}
                  </TabsContent>

                  <TabsContent value="trending" className="mt-3 space-y-0">
                    {sortedPosts.map((post: FeedPost, index: number) => (
                      <React.Fragment key={post._id}>
                        <FeedCard
                          post={post}
                          onLike={() => handleLike(post._id)}
                          onUnlike={() => handleUnlike(post._id)}
                          onComment={(content) => handleComment(post._id, content)}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          initialLiked={post.has_scored}
                        />
                        {/* Show suggested users after 4th post */}
                        {index === 3 && <SuggestedUsersCarousel />}
                        {/* Show suggested pages after 8th post */}
                        {index === 7 && <SuggestedPagesCarousel />}
                        {/* Show suggested users again after 15th post */}
                        {index === 14 && <SuggestedUsersCarousel />}
                        {/* Show suggested pages again after 22nd post */}
                        {index === 21 && <SuggestedPagesCarousel />}
                      </React.Fragment>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Sidebar - Only show on large screens with proper sticky positioning */}
            <div className="hidden lg:block lg:w-[21rem] lg:flex-shrink-0 lg:pt-4">
              <div className="space-y-4">
                <FollowingPagesCard />
                <SuggestedPagesCard />
                <SuggestedUsers />
                <TopWeeklyChallengers />

                {/* Make only this card sticky */}
                <div className="sticky top-20">
                  <TrendingCategories />
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Feed Action Button */}
      <FeedActionButton onClick={handleActionButtonClick} />

      {/* Create Post Modal */}
      {showCreateModal && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create New Post</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <CreatePostCard
                user={user}
                onPostCreate={async (postData) => {
                  await handlePostCreate(postData)
                  setShowCreateModal(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Feed
