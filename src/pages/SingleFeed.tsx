import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, ChevronLeft, ChevronRight, Share2, MessageCircle, Check, MoreHorizontal, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VideoPlayer } from "@/components/ui/VideoPlayer"
import { ScoreModal } from "@/components/feed/ScoreModal"
import { CommentModal } from "@/components/feed/CommentModal"
import { ShareModal } from "@/components/feed/ShareModal"
import { useFeed } from "@/hooks/useFeed"
import { useAuth } from "@/hooks/useAuth"
import { LinkupButton } from "@/components/feed/LinkupButton"
import { LinkupCount } from "@/components/feed/LinkupCount"

export const SingleFeed: React.FC = () => {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [currentScore, setCurrentScore] = useState(0)
  const [currentPeopleCount, setCurrentPeopleCount] = useState(0)

  const { getPost, getSuggestedPostsByUser, deletePost } = useFeed()
  const { loggedInUser } = useAuth()

  // Always call all hooks in the same order
  const { data: postResponse, isLoading: isLoadingPost, error: postError } = getPost(postId || '')
  const post = postResponse?.data

  // Always call this hook, but conditionally enable it
  const { data: suggestedPosts = [], isLoading: isLoadingSuggested } = getSuggestedPostsByUser(
    postId || '',
    post?.user_id || '',
    { enabled: !!post?.user_id } // Only enable when we have user_id
  )

  // Fetch user data - always call useEffect
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

  // Update local state when post data changes - always call useEffect
  React.useEffect(() => {
    if (post) {
      setCurrentScore(post.total_score)
      setCurrentPeopleCount(post.people_score_count)
    }
  }, [post])

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading post...</div>
      </div>
    )
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <Button onClick={() => navigate('/feed')}>Back to Feed</Button>
        </div>
      </div>
    )
  }

  const formatScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`
    }
    return score.toString()
  }

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId || '')
        navigate('/feed')
      } catch (error) {
        console.error("Error deleting post:", error)
      }
    }
  }

  // Check if current user is the post owner
  const isOwner = user && post && user.user_id === post.user_id

  const handleOptimisticUpdate = (scoreChange: number, peopleChange: number) => {
    setCurrentScore(prev => prev + scoreChange)
    setCurrentPeopleCount(prev => prev + peopleChange)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/feed')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
          {/* Menu Dropdown - Only show for post owner */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 z-50">
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Media */}
            {((post.images && post.images.length > 0) || (post.videos && post.videos.length > 0)) && (
              <div className="relative">
                <div className="bg-muted rounded-lg overflow-hidden max-h-[60vh] lg:max-h-[70vh]">
                  <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                    {/* Render images first */}
                    {post.images?.map((image, index) => (
                      <div key={`image-${index}`} className="w-full flex-shrink-0">
                        <img
                          src={image}
                          alt={`${post.title} - Image ${index + 1}`}
                          className="w-full h-auto object-contain flex-shrink-0 max-h-[60vh] lg:max-h-[70vh]"
                          style={{ height: '468px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    ))}
                    {/* Render videos */}
                    {post.videos?.map((video, index) => (
                      <div key={`video-${index}`} className="w-full flex-shrink-0">
                        <VideoPlayer
                          src={video}
                          className="w-full h-[60vh] lg:h-[70vh]"
                          enableScrollAutoPlay={false}
                          enablePictureInPicture={false}
                          autoPlayWithSound={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media Navigation */}
                {((post.images?.length || 0) + (post.videos?.length || 0)) > 1 && (
                  <>
                    {currentImageIndex > 0 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}
                    {currentImageIndex < ((post.images?.length || 0) + (post.videos?.length || 0)) - 1 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    {/* Media Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                      {Array.from({ length: (post.images?.length || 0) + (post.videos?.length || 0) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Post Content */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground" style={{ fontSize: '18px' }}>{post.title}</h1>

              <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '14px' }}>
                {post.description}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" style={{ fontSize: '12px' }}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t">
                <div className="flex flex-wrap w-full gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowScoreModal(true)}
                    className="flex items-center gap-1 text-xs min-w-0"
                  >
                    <Star className={`h-4 w-4 ${post.has_scored ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="truncate">
                      {currentPeopleCount} people • score {formatScore(currentScore)}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowCommentModal(true)}
                    className="flex items-center gap-1 text-xs min-w-0"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="truncate">{post.comments_count} comments</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1 text-xs min-w-0"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="truncate">Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar
                    className="h-16 w-16 cursor-pointer"
                    style={{ alignSelf: 'self-start' }}
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  >
                    <AvatarImage
                      src={post?.user?.profile_avatar ? post?.user?.profile_avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(post?.user?.first_name)}`}
                      alt={`${post.user.first_name} ${post.user.last_name}`}
                    />
                    <AvatarFallback>
                      {post.user.first_name[0]}
                      {post.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3
                          className="font-semibold cursor-pointer hover:underline mb-1"
                          style={{ fontSize: '16px' }}
                          onClick={() => navigate(`/profile/${post.user_id}`)}
                        >
                          {post.user.first_name} {post.user.last_name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-1">
                          {post.user.is_vetted && post.user.responder_info?.job_title
                            ? post.user.responder_info.job_title
                            : 'Community Member'}
                        </p>
                        <LinkupCount userId={post.user_id} className="mb-2" />
                      </div>
                    </div>

                    {!isOwner && (
                      <div className="flex items-center gap-2 mb-3 h-9">
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/chat/user/${post.user_id}`)}
                            className="flex items-center gap-1 bg-white hover:none border-gray-300 h-9"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            <span className="text-xs">Message</span>
                          </Button>
                          <LinkupButton userId={post.user_id} />
                        </>
                      </div>
                    )}

                    {post.user.is_vetted && post.user.responder_info && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium" style={{ fontSize: '12px' }}>
                            Vetted Verified
                          </span>
                        </div>
                        {post.user.responder_info.rank_status && (
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                            style={{
                              backgroundColor: post.user.responder_info.rank_status.rank_color + '20',
                              borderColor: post.user.responder_info.rank_status.rank_color,
                              color: post.user.responder_info.rank_status.rank_color
                            }}
                          >
                            {post.user.responder_info.rank_status.rank_name}
                          </Badge>
                        )}
                      </div>
                    )}

                    {!post.user.is_vetted && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                          Joined {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  {post.user.is_vetted && post.user.responder_info && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Experience:</span>
                        <div className="font-medium">{post.user.responder_info.years_of_experience} years</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div>
                          <Badge variant="outline" className="text-green-600 text-xs">
                            {post.user.responder_info.availability_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Posts */}
            {suggestedPosts.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4" style={{ fontSize: '14px' }}>
                    More from {post.user.first_name}
                  </h3>
                  <div className="space-y-4">
                    {suggestedPosts.map((suggestedPost) => (
                      <div
                        key={suggestedPost._id}
                        className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        onClick={() => navigate(`/feed/${suggestedPost._id}`)}
                      >
                        <div className="flex space-x-3">
                          {suggestedPost.images?.[0] && (
                            <img
                              src={suggestedPost.images[0]}
                              alt={suggestedPost.title}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg"
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-2" style={{ fontSize: '12px' }}>
                              {suggestedPost.title}
                            </h4>
                            <p className="text-muted-foreground mt-1" style={{ fontSize: '12px' }}>
                              {formatScore(suggestedPost.total_score)} score • {suggestedPost.comments_count} comments
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Score Modal */}
      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        postId={post._id}
        currentUserScore={post.has_scored ? 8 : 0}
        hasScored={post.has_scored}
        onOptimisticUpdate={handleOptimisticUpdate}
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={post._id}
        currentUser={user}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={{
          id: post._id,
          title: post.title,
          description: post.description
        }}
      />
    </div>
  )
}
