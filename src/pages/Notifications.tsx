"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  CheckCircle,
  Calendar,
  MessageSquare,
  UserPlus,
  Heart,
  Award,
  Filter,
  MoreHorizontal,
  Settings,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkupButton } from "@/components/feed/LinkupButton"
import { toast } from "@/components/ui/sonner"

export interface Notification {
  id: string
  type: "task-accepted" | "task-completed" | "message" | "deadline" | "linkup" | "like" | "comment" | "achievement"
  title: string
  content: string
  timestamp: Date
  isRead: boolean
  taskId?: string
  userId?: string
  userName?: string
  userAvatar?: string
  isLinkedUp?: boolean
  actionRequired?: boolean
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "linkup",
    title: "New Linkup",
    content: "Sarah Johnson linked up with you",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    isRead: false,
    userId: "user1",
    userName: "Sarah Johnson",
    userAvatar: "SJ",
    isLinkedUp: false,
    actionRequired: true,
  },
  {
    id: "2",
    type: "task-accepted",
    title: "Task Accepted",
    content: "Your research paper task has been accepted by Mike Chen",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    taskId: "1",
    userId: "user2",
    userName: "Mike Chen",
    userAvatar: "MC",
  },
  {
    id: "3",
    type: "like",
    title: "Post Liked",
    content: "Aisha Okafor and 12 others liked your post about React development",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    isRead: false,
    userId: "user3",
    userName: "Aisha Okafor",
    userAvatar: "AO",
  },
  {
    id: "4",
    type: "comment",
    title: "New Comment",
    content: 'David Kim commented on your post: "Great insights on TypeScript!"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: true,
    userId: "user4",
    userName: "David Kim",
    userAvatar: "DK",
  },
  {
    id: "5",
    type: "message",
    title: "New Message",
    content: "You have received a new message about your essay task",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    isRead: true,
    taskId: "2",
    userId: "user5",
    userName: "Emma Wilson",
    userAvatar: "EW",
  },
  {
    id: "6",
    type: "achievement",
    title: "Achievement Unlocked",
    content: 'Congratulations! You\'ve earned the "Top Contributor" badge',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    isRead: true,
  },
  {
    id: "7",
    type: "deadline",
    title: "Deadline Approaching",
    content: 'Your task "Market Research Report" is due in 24 hours',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    isRead: false,
    taskId: "4",
  },
  {
    id: "8",
    type: "linkup",
    title: "New Linkup",
    content: "James Rodriguez linked up with you",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
    isRead: true,
    userId: "user6",
    userName: "James Rodriguez",
    userAvatar: "JR",
    isLinkedUp: true,
  },
]

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        setNotifications(mockNotifications)
      } catch (error) {
        toast.error("Failed to load notifications")
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
    toast.success("All notifications marked as read")
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.taskId) {
      if (notification.type === "message") {
        navigate(`/chat/${notification.taskId}`)
      } else {
        navigate(`/task/${notification.taskId}`)
      }
    } else if (notification.userId && notification.type === "linkup") {
      navigate(`/profile/${notification.userId}`)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "task-accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "task-completed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "deadline":
        return <Calendar className="h-5 w-5 text-yellow-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "linkup":
        return <UserPlus className="h-5 w-5 text-primary" />
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "comment":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "achievement":
        return <Award className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-beembyte-blue" />
    }
  }

  const filterNotifications = (notifications: Notification[], filter: string) => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.isRead)
      case "linkups":
        return notifications.filter((n) => n.type === "linkup")
      case "tasks":
        return notifications.filter((n) => ["task-accepted", "task-completed", "deadline"].includes(n.type))
      case "social":
        return notifications.filter((n) => ["like", "comment", "message"].includes(n.type))
      default:
        return notifications
    }
  }

  const filteredNotifications = filterNotifications(notifications, activeTab)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Stay updated with your latest activities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} size="sm">
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Card className="shadow-sm border-0 bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-0 border-b">
              <TabsList className="grid w-full grid-cols-5 bg-gray-50">
                <TabsTrigger value="all" className="text-sm">
                  All
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-sm">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="linkups" className="text-sm">
                  Linkups
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {notifications.filter((n) => n.type === "linkup").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-sm">
                  Tasks
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {
                      notifications.filter((n) => ["task-accepted", "task-completed", "deadline"].includes(n.type))
                        .length
                    }
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="social" className="text-sm">
                  Social
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {notifications.filter((n) => ["like", "comment", "message"].includes(n.type)).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-0">
              <TabsContent value={activeTab} className="mt-0">
                {filteredNotifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group relative ${
                          !notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar or Icon */}
                          <div className="flex-shrink-0">
                            {notification.userAvatar ? (
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(notification.userName || "User")}`}
                                  alt={notification.userName}
                                />
                                <AvatarFallback className="bg-primary text-white text-sm">
                                  {notification.userAvatar}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                {getIcon(notification.type)}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p
                                  className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}
                                >
                                  {notification.content}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                  </p>
                                  {notification.type && (
                                    <Badge variant="outline" className="text-xs">
                                      {notification.type.replace("-", " ")}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Action Button */}
                              {notification.actionRequired &&
                                notification.type === "linkup" &&
                                !notification.isLinkedUp && (
                                  <div className="ml-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <LinkupButton
                                      userId={notification.userId!}
                                      className="text-xs px-3 py-1"
                                    />
                                  </div>
                                )}

                              {/* More Options */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 ml-2 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Unread Indicator */}
                          {!notification.isRead && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activeTab === "unread" ? "All caught up!" : "No notifications"}
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === "unread"
                        ? "You've read all your notifications"
                        : `No ${activeTab === "all" ? "" : activeTab + " "}notifications to show`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default Notifications
