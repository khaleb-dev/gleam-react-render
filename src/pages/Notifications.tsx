"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, MoreHorizontal, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NotificationsList } from "@/components/notifications/NotificationsList"
import { ActivityFeed } from "@/components/profile/ActivityFeed"
import { useNotifications } from "@/hooks/useNotifications"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Notifications() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const {
    notifications,
    activities,
    isLoading,
    unreadCount,
    markNotificationAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchActivities,
  } = useNotifications()

  useEffect(() => {
    fetchNotifications()
    fetchActivities()
  }, [])

  const handleReadNotification = (id: string) => {
    markNotificationAsRead(id)
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card">
          <NotificationsList
            notifications={notifications}
            onMarkAllAsRead={markAllAsRead}
            onReadNotification={handleReadNotification}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Notifications Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0 bg-card">
              {/* Desktop Header */}
              <div className="p-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-semibold text-card-foreground">Notifications</h1>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Keep track of the activity around your account</p>
              </div>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : (
                  <NotificationsList
                    notifications={notifications}
                    onMarkAllAsRead={markAllAsRead}
                    onReadNotification={handleReadNotification}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Hidden on mobile */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="bg-card rounded-lg shadow-sm border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Your recent activities and interactions</p>
              </div>
              <div className="p-4">
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity._id} className="p-3 bg-accent/20 rounded-lg">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
