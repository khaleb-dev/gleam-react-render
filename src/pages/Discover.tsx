import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Hash, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate, useSearchParams } from "react-router-dom"
import { API_BASE_URL } from "@/config/env"
import { useSuggestedPages } from "@/hooks/useSuggestedPages"
import { useFollowingPages } from "@/hooks/useFollowingPages"
import { useFollowCompanyPage, useUnfollowCompanyPage, useFollowStatus } from "@/hooks/useCompanyPageFollow"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

interface TrendingCategory {
  category: string
  tag: string
  post_count: number
  growth_percentage: number
}

const getCategoryColor = (category: string) => {
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-orange-500", "bg-red-500", "bg-teal-500",
    "bg-indigo-500", "bg-pink-500", "bg-cyan-500"
  ]
  const index = (category || '').toLowerCase().charCodeAt(0) % colors.length
  return colors[index]
}

export const Discover: React.FC = () => {
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "trends"

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  useEffect(() => {
    const fetchTrendingCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed/trending-category`)
        if (response.ok) {
          const data = await response.json()
          setTrendingCategories(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching trending categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingCategories()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discover</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore trending topics and popular discussions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="trends" className="text-xs sm:text-sm px-2 py-2">Trending Topics</TabsTrigger>
            <TabsTrigger value="pages" className="text-xs sm:text-sm px-2 py-2">Suggested Pages</TabsTrigger>
            <TabsTrigger value="following" className="text-xs sm:text-sm px-2 py-2">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="mt-6">
            <div className="grid gap-4">
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </CardContent>
                </Card>
              ) : trendingCategories.length === 0 ? (
                <Card>
                  <CardContent className="text-center p-8 text-gray-500">
                    No trending topics found
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-2 sm:p-6 space-y-2">
                    {trendingCategories.map((category, index) => (
                      <div
                        key={`${category.category}-${category.tag}-${index}`}
                        className="flex items-center justify-between p-2 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer min-w-0"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                              #{index + 1}
                            </div>
                            <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {category.tag || 'Unknown'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {category.post_count || 0} posts
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-auto text-xs ${(category.growth_percentage || 0) > 0 ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'
                            }`}
                        >
                          +{category.growth_percentage || 0}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pages" className="mt-6">
            <SuggestedPagesTab />
          </TabsContent>
          
          <TabsContent value="following" className="mt-6">
            <FollowingPagesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const SuggestedPagesTab: React.FC = () => {
  const { data: suggestedPages, isLoading } = useSuggestedPages();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestedPages?.success || !suggestedPages.data.pages.length) {
    return (
      <Card>
        <CardContent className="text-center p-8 text-gray-500">
          No suggested pages found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {suggestedPages.data.pages.map((page) => (
        <SuggestedPageCard key={page._id} page={page} />
      ))}
    </div>
  );
};

interface SuggestedPageCardProps {
  page: any;
}

const SuggestedPageCard: React.FC<SuggestedPageCardProps> = ({ page }) => {
  const { data: followStatus } = useFollowStatus(page._id);
  const followMutation = useFollowCompanyPage();
  const unfollowMutation = useUnfollowCompanyPage();
  const navigate = useNavigate();

  const isFollowing = followStatus?.data?.isFollowing || false;

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate(page._id);
    } else {
      followMutation.mutate(page._id);
    }
  };

  const handlePageClick = () => {
    navigate(`/company/page/${page.company_url}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handlePageClick}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
              <AvatarImage src={page.logo} />
              <AvatarFallback className="text-sm sm:text-lg">
                {page.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-1 break-words">
                {page.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
                {page.tag_line}
              </p>
              <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="break-words">{page.industry}</span>
                <span>•</span>
                <span>{page.size} employees</span>
              </div>
            </div>
          </div>
          <Button
            variant={isFollowing ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowToggle();
            }}
            disabled={followMutation.isPending || unfollowMutation.isPending}
            className="shrink-0 w-full sm:w-auto"
            size="sm"
          >
            {isFollowing ? "Following" : <><Plus className="h-4 w-4 mr-1" />Follow</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FollowingPagesTab: React.FC = () => {
  const { data: followingPages, isLoading } = useFollowingPages();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (!followingPages?.success || !followingPages.data.pages.length) {
    return (
      <Card>
        <CardContent className="text-center p-8 text-gray-500">
          You're not following any pages yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {followingPages.data.pages.map((page) => (
        <FollowingPageCard key={page._id} page={page} />
      ))}
    </div>
  );
};

interface FollowingPageCardProps {
  page: any;
}

const FollowingPageCard: React.FC<FollowingPageCardProps> = ({ page }) => {
  const unfollowMutation = useUnfollowCompanyPage();
  const navigate = useNavigate();

  const handleUnfollow = () => {
    unfollowMutation.mutate(page._id);
  };

  const handlePageClick = () => {
    navigate(`/company/page/${page.company_url}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handlePageClick}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
              <AvatarImage src={page.logo} />
              <AvatarFallback className="text-sm sm:text-lg">
                {page.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-1 break-words">
                {page.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
                {page.tag_line}
              </p>
              <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="break-words">{page.industry}</span>
                <span>•</span>
                <span>{page.size} employees</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleUnfollow();
            }}
            disabled={unfollowMutation.isPending}
            className="shrink-0 w-full sm:w-auto"
            size="sm"
          >
            {unfollowMutation.isPending ? "Unfollowing..." : "Unfollow"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};