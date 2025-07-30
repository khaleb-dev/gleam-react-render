"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Trophy } from "lucide-react"
import { API_BASE_URL } from "@/config/env"

interface TopResponder {
  user_id: string
  name: string
  total_earned: number
  task_count: number
  responder_info: {
    _id: string
    rank_criteria: {
      tasks_completed: number
      minimum_rating: number
    }
    rank_status: {
      _id: string
      rank_name: string
      rank_color: string
      min_tasks_completed: number
      min_rating: number
    }
  }
}

const getRankColor = (rank: string) => {
  switch (rank) {
    case "novice":
      return "bg-gray-100 text-gray-700"
    case "intermediate":
      return "bg-blue-100 text-blue-700"
    case "expert":
      return "bg-purple-100 text-purple-700"
    case "master":
      return "bg-yellow-100 text-yellow-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export const WeeklyTopResponders: React.FC = () => {
  const [topResponders, setTopResponders] = useState<TopResponder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopResponders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/top-monthly-responders`)
        if (response.ok) {
          const data = await response.json()
          setTopResponders(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching top responders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopResponders()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>Top Responders This Month</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : topResponders.length === 0 ? (
          <div className="text-center p-4 text-gray-500 text-sm">
            No top responders this month
          </div>
        ) : (
          topResponders.map((responder, index) => (
            <div
              key={responder.user_id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2 flex-1">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${responder.name}`} alt={responder.name} />
                    <AvatarFallback className="text-xs">{responder.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${index === 0
                        ? "bg-yellow-500 text-white"
                        : index === 1
                          ? "bg-gray-400 text-white"
                          : "bg-orange-600 text-white"
                        }`}
                    >
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{responder.name}</p>
                    <Badge variant="outline" className={`text-xs px-1 py-0 ${getRankColor(responder.responder_info.rank_status.rank_name)}`}>
                      {responder.responder_info.rank_status.rank_name}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400 mr-0.5" />
                      <span>{responder.responder_info.rank_criteria.minimum_rating}</span>
                    </div>
                    <span>•</span>
                    <span>{responder.task_count} tasks</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400">₦{responder.total_earned}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">this month</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
