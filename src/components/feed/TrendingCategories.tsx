"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Hash, ArrowRight } from "lucide-react"
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

export const TrendingCategories: React.FC = () => {
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const handleViewMore = () => {
    navigate('/discover')
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Discover</span>
          </CardTitle>
          {trendingCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewMore}
              className="text-xs h-auto p-1"
            >
              View More
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : trendingCategories.length === 0 ? (
          <div className="text-center p-4 text-gray-500 text-xs">
            No trending topic
          </div>
        ) : (
          trendingCategories.map((category, index) => (
            <div
              key={`${category.category}-${category.tag}-${index}`}
              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-xs">
                  #{index + 1}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {category.tag || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.post_count || 0} posts
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={`text-xs px-1.5 py-0.5 ${(category.growth_percentage || 0) > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                    }`}
                >
                  +{category.growth_percentage || 0}%
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
