import { formatDistanceToNow } from "date-fns"
import { Star, MessageCircle, Briefcase, Users, FileText, ActivityIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Activity } from "@/services/notificationApi"

interface ActivityFeedProps {
  activities: Activity[]
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "post":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-green-600" />
      case "task":
        return <Briefcase className="h-4 w-4 text-purple-600" />
      case "linkup":
        return <Users className="h-4 w-4 text-orange-600" />
      case "score":
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "post":
        return "bg-blue-100 text-blue-700"
      case "comment":
        return "bg-green-100 text-green-700"
      case "task":
        return "bg-purple-100 text-purple-700"
      case "linkup":
        return "bg-orange-100 text-orange-700"
      case "score":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true })
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays === 1) return "1 day ago"
        if (diffInDays < 7) return `${diffInDays} days ago`
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
        return `${Math.floor(diffInDays / 30)} months ago`
      }
    } catch {
      return "Recently"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          Activity
        </h3>
        <p className="text-sm text-gray-600 mt-1">Your recent activities and interactions</p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <div key={activity._id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      getTypeColor(activity.type),
                    )}
                  >
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={cn("text-xs capitalize", getTypeColor(activity.type))}>
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{getTimeAgo(activity.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ActivityIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">No activities yet</h4>
            <p className="text-muted-foreground text-sm">Start interacting to see your activities here</p>
          </div>
        )}
      </div>
    </div>
  )
}
