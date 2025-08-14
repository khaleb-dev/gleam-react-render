import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Hash, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "@/config/env"

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
      <div className="max-w-4xl mx-auto px-4 py-6">
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

        {/* Trending Categories Grid */}
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
            <>
              <Card>
                <CardContent className="space-y-3">
                  {trendingCategories.map((category, index) => (
                    <div
                      key={`${category.category}-${category.tag}-${index}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">

                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                            #{index + 1}
                          </div>
                          <Hash className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {category.tag || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.post_count || 0} posts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className={`${(category.growth_percentage || 0) > 0 ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'
                            }`}
                        >
                          +{category.growth_percentage || 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}