"use client"

import { useEffect } from "react"
import { Bell, Settings, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationsList } from "@/components/notifications/NotificationsList"
import { ActivityFeed } from "@/components/profile/ActivityFeed"
import { useNotifications } from "@/hooks/useNotifications"

const Notifications = () => {
  const { 
    notifications, 
    activities,
    isLoading, 
    unreadCount, 
    markNotificationAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-foreground" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground mt-1">Stay updated with your latest activities</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <div className="bg-card rounded-lg border shadow-sm">
              <NotificationsList
                notifications={notifications}
                onMarkAllAsRead={markAllAsRead}
                onReadNotification={handleNotificationClick}
              />
            </div>
          </div>

          {/* Right: Activity Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Activity</h2>
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
