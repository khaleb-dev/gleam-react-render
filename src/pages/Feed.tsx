"use client"
import React, { useState } from "react"
import { FeedCard } from "@/components/feed/FeedCard"
import { CreatePostCard } from "@/components/feed/CreatePostCard"
import { WeeklyTopResponders } from "@/components/feed/WeeklyTopResponders"
import { TrendingCategories } from "@/components/feed/TrendingCategories"
import { SuggestedUsers } from "@/components/feed/SuggestedUsers"
import { MobileSuggestedUsers } from "@/components/feed/MobileSuggestedUsers"
import { FeedActionButton } from "@/components/feed/FeedActionButton"
import { useAuth } from "@/hooks/useAuth"
import { useFeed } from "@/hooks/useFeed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { User } from "@/types"

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
    profile_avatar: string
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
  people_score_count: number
}

const Feed = () => {
  const { loggedInUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { getFeedPosts, createPost, likePost, unlikePost, commentOnPost, deleteComment, deletePost } = useFeed()

  // Fetch feed posts from API with increased limit
  const { data: feedData, isLoading: feedLoading, error: feedError } = getFeedPosts(1, 50)

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

  // Use API data and filter only active posts
  const postsToShow = (feedData?.posts || []).filter((post: any) => post.is_active !== false)

  const filteredPosts = postsToShow.filter(
    (post: any) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handlePostCreate = async (postData: any) => {
    await createPost(postData)
  }

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId)
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleUnlike = async (postId: string) => {
    try {
      await unlikePost(postId)
    } catch (error) {
      console.error("Error unliking post:", error)
    }
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      await commentOnPost({ postId, payload: { content } })
    } catch (error) {
      console.error("Error commenting on post:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId)
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleDeletePost = async (postId: string) => {
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
      <div className="pt-0 p-0">
        <main className="flex-grow">
          {/* Hero Section - No padding on mobile */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="w-full px-0 sm:px-4 py-4">
              <div className="text-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Explore the community update
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 px-4 sm:px-0">
                  Share your progress, projects, and ideas — and discover what others in the Beembyte community are building.
                </p>
                {/* Search Bar */}
                <div className="max-w-xl mx-auto relative px-4 sm:px-0">
                  <Search className="absolute left-7 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    type="text"
                    placeholder="Search feed title or content...."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-1.5 text-xs w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout on Large Screens */}
          <div className="w-full lg:max-w-6xl lg:mx-auto lg:flex lg:gap-6 lg:px-4 lg:justify-center">
            {/* Main Feed - Instagram Width on Large Screens */}
            <div className="w-full lg:max-w-[510px] lg:flex-shrink-0 lg:mx-auto lg:mr-6">
              {/* Create Post Card - only show if logged in */}
              {user && (
                <div className="w-full px-4 lg:px-0 py-3">
                  <CreatePostCard user={user} onPostCreate={handlePostCreate} />
                </div>
              )}

              {/* Mobile Suggested Users - Only show on mobile */}
              <div className="block lg:hidden">
                <MobileSuggestedUsers />
              </div>

              {/* Filter Tabs */}
              <div className="w-full px-0 sm:px-4 lg:px-0 mb-3">
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

                  <TabsContent value="all" className="mt-3 space-y-0">
                    {filteredPosts.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchQuery
                            ? "Try adjusting your search"
                            : "Be the first to share something with the community!"}
                        </p>
                      </div>
                    ) : (
                      filteredPosts.map((post: FeedPost) => (
                        <FeedCard
                          key={post._id}
                          post={post}
                          onLike={() => handleLike(post._id)}
                          onUnlike={() => handleUnlike(post._id)}
                          onComment={(content) => handleComment(post._id, content)}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          initialLiked={post.has_scored}
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="design" className="mt-3 space-y-0">
                    {filteredPosts
                      .filter((post) => post.tags.some(tag => tag.toLowerCase().includes('project')))
                      .map((post: FeedPost) => (
                        <FeedCard
                          key={post._id}
                          post={post}
                          onLike={() => handleLike(post._id)}
                          onUnlike={() => handleUnlike(post._id)}
                          onComment={(content) => handleComment(post._id, content)}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          initialLiked={post.has_scored}
                        />
                      ))}
                  </TabsContent>

                  <TabsContent value="development" className="mt-3 space-y-0">
                    {filteredPosts
                      .filter((post) => post.tags.some(tag => tag.toLowerCase().includes('job')))
                      .map((post: FeedPost) => (
                        <FeedCard
                          key={post._id}
                          post={post}
                          onLike={() => handleLike(post._id)}
                          onUnlike={() => handleUnlike(post._id)}
                          onComment={(content) => handleComment(post._id, content)}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          initialLiked={post.has_scored}
                        />
                      ))}
                  </TabsContent>

                  <TabsContent value="trending" className="mt-3 space-y-0">
                    {filteredPosts
                      .sort((a, b) => b.total_score - a.total_score)
                      .map((post: FeedPost) => (
                        <FeedCard
                          key={post._id}
                          post={post}
                          onLike={() => handleLike(post._id)}
                          onUnlike={() => handleUnlike(post._id)}
                          onComment={(content) => handleComment(post._id, content)}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          initialLiked={post.has_scored}
                        />
                      ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar - Only show on large screens */}
            <div className="hidden lg:block lg:w-80 lg:flex-shrink-0 lg:pt-3 lg:ml-0">
              <div className="space-y-4">
                {/* Suggested Users Section */}
                <SuggestedUsers />
                {/* Top Responders Section */}
                <WeeklyTopResponders />
                {/* Categories Section */}
                <TrendingCategories />
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
