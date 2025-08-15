"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  MessageSquare,
  Users,
  Star,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { ApiNotification } from "@/services/notificationApi"
import { useIsMobile } from "@/hooks/use-mobile"

interface LinkedInNotificationItemProps {
  notification: ApiNotification
  onRead: (id: string) => void
}

export const LinkedInNotificationItem = ({ notification, onRead }: LinkedInNotificationItemProps) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification._id)
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case "task":
        return <Briefcase className="h-4 w-4 text-blue-600" />
      case "chat":
        return <MessageSquare className="h-4 w-4 text-green-600" />
      case "linkups":
        return <Users className="h-4 w-4 text-purple-600" />
      case "score":
        return <Star className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-600" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "system":
        return <Bell className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) return "now"
      if (diffInHours < 24) return `${diffInHours}h`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) return "1d"
      if (diffInDays < 7) return `${diffInDays}d`
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`
      return `${Math.floor(diffInDays / 30)}mo`
    } catch {
      return "now"
    }
  }

  const getActionText = () => {
    switch (notification.type) {
      case "score":
        return `rated your post ${notification.reference_id?.score || ""} stars`
      case "comment":
        return "commented on your post"
      case "linkups":
        return "linked up with you"
      case "task":
        return "accepted your task"
      default:
        return notification.message
    }
  }

  const senderName = notification.sender_id
    ? `${notification.sender_id.first_name} ${notification.sender_id.last_name}`
    : "BeemByte"

  return (
    <div
      className={cn(
        "hover:bg-accent/50 cursor-pointer transition-all group relative",
        !notification.is_read && "bg-blue-50/60 dark:bg-blue-950/20",
        isMobile ? "px-3 py-3" : "px-4 lg:px-5 py-3",
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Sender Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          {notification.sender_id ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/profile/${notification.sender_id.user_id || notification.sender_id._id}`)
              }}
            >
              <Avatar className={`${isMobile ? "h-12 w-12" : "h-12 w-12"} border-2 border-background shadow-sm`}>
                <AvatarImage
                  src={
                    notification.sender_id.profile_avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(notification.sender_id.first_name)}`
                  }
                  alt={senderName}
                  className="object-cover"
                />
                <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                  {notification.sender_id.first_name?.[0]}
                  {notification.sender_id.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <div
              className={`${isMobile ? "h-12 w-12" : "h-12 w-12"} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm`}
            >
              <Bell className="h-5 w-5 text-white" />
            </div>
          )}

          {/* Type indicator badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full border-2 border-background shadow-sm flex items-center justify-center">
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              {/* Main message */}
              <div className="mb-2">
                <span
                  className={cn(
                    "text-xs leading-relaxed",
                    !notification.is_read ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (notification.sender_id) {
                        navigate(`/profile/${notification.sender_id.user_id || notification.sender_id._id}`)
                      }
                    }}
                    className="font-semibold text-foreground hover:text-blue-600 hover:underline"
                  >
                    {senderName}
                  </button>
                  {notification.sender_id && notification.type === "linkups" && (
                    <>
                      {" "}
                      and <span className="font-medium text-foreground">1 other</span>
                    </>
                  )}
                  <span className="text-foreground"> {getActionText()}</span>
                </span>
              </div>

              {/* Reference content preview - Larger size */}
              {notification.reference_id?.post_id && (
                <div className="bg-muted/50 p-3 mb-3 hover:bg-muted/70 transition-colors rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    {notification.reference_id.post_id.images?.length > 0 && (
                      <div
                        className={`${isMobile ? "w-14 h-14" : "w-16 h-16"} bg-muted rounded flex-shrink-0 overflow-hidden`}
                      >
                        <img
                          src={notification.reference_id.post_id.images[0] || "/placeholder.svg"}
                          alt="Post preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-foreground line-clamp-2 mb-1`}
                      >
                        {notification.reference_id.post_id.title}
                      </p>
                      {notification.reference_id.post_id.description && (
                        <p
                          className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground line-clamp-2 leading-relaxed`}
                        >
                          {isMobile 
                            ? notification.reference_id.post_id.description.length > 50
                              ? notification.reference_id.post_id.description.substring(0, 50) + "..."
                              : notification.reference_id.post_id.description
                            : notification.reference_id.post_id.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Comment content preview - Larger size */}
              {notification.type === "comment" && notification.reference_id?.content && (
                <div className="bg-muted/50 p-3 mb-3 rounded-lg border border-border">
                  <p className={`${isMobile ? "text-xs" : "text-xs"} text-foreground italic line-clamp-2`}>
                    "{isMobile 
                      ? notification.reference_id.content.length > 40
                        ? notification.reference_id.content.substring(0, 40) + "..."
                        : notification.reference_id.content
                      : notification.reference_id.content
                    }"
                  </p>
                </div>
              )}

              {/* Score display */}
              {notification.type === "score" && notification.reference_id?.score && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className={"h-4 w-4 text-red-500 fill-current"} />
                  <span className="text-sm text-muted-foreground ml-1 font-medium">
                    {notification.reference_id.score}/10
                  </span>
                </div>
              )}

              {/* Action buttons for specific types */}
              {notification.type === "linkups" && (
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-6 text-sm font-medium border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/profile/${notification.sender_id?.user_id || notification.sender_id?._id}`)
                    }}
                  >
                    View profile
                  </Button>
                </div>
              )}

              {/* Special action buttons for analytics */}
              {notification.message?.includes("new visitors") && (
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-6 text-sm font-medium border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle see visitor analytics action
                    }}
                  >
                    See visitor analytics
                  </Button>
                </div>
              )}

              {/* Likes count for reactions */}
              {notification.message?.includes("reacted") && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">2 Likes</p>
                </div>
              )}

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {getTimeAgo(notification.created_at)}
                  </span>
                  {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-600"></div>}
                </div>
              </div>
            </div>

            {/* More options and arrow indicator */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 transition-opacity", isHovered ? "opacity-100" : "opacity-0")}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle more options
                  }}
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
              <div className={cn("transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
