"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  Filter,
  Settings,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NotificationsList } from "@/components/notifications/NotificationsList"
import { useNotifications } from "@/hooks/useNotifications"


const Notifications = () => {
  const navigate = useNavigate()
  const { 
    notifications, 
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
    // Navigation will be handled by the NotificationItem component
  }


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
              <Button onClick={markAllAsRead} size="sm">
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <Card className="shadow-sm border-0 bg-white">
          <NotificationsList
            notifications={notifications}
            onMarkAllAsRead={markAllAsRead}
            onReadNotification={handleNotificationClick}
          />
        </Card>
      </div>
    </div>
  )
}

export default Notifications
