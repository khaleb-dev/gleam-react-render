"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, MoreHorizontal } from "lucide-react"
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Notifications Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0 bg-white">
              {/* Desktop Header */}
              <div className="p-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-semibold text-gray-900">Activity</h1>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Keep track of the activity around your account</p>
              </div>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading notifications...</p>
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
            <ActivityFeed activities={activities} />

          </div>
        </div>
      </div>
    </div>
  )
}
