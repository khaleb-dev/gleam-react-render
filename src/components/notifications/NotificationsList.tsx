"use client"

import { useState } from "react"
import { LinkedInNotificationItem } from "./LinkedInNotificationItem"
import { Button } from "@/components/ui/button"
import { CheckCheck, ChevronDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { ApiNotification } from "@/services/notificationApi"
import { useIsMobile } from "@/hooks/use-mobile"

interface NotificationsListProps {
  notifications: ApiNotification[]
  onMarkAllAsRead: () => void
  onReadNotification: (id: string) => void
}

export const NotificationsList = ({ notifications, onMarkAllAsRead, onReadNotification }: NotificationsListProps) => {
  const [activeTab, setActiveTab] = useState("all")
  const isMobile = useIsMobile()
  const hasUnread = notifications.some((notification) => !notification.is_read)

  const filterNotifications = (notifications: ApiNotification[], filter: string) => {
    switch (filter) {
      case "all":
        return notifications
      case "comments":
        return notifications.filter((n) => n.type === "comment")
      case "scores":
        return notifications.filter((n) => n.type === "score")
      case "linkups":
        return notifications.filter((n) => n.type === "linkups")
      case "tasks":
        return notifications.filter((n) => n.type === "task")
      case "mentions":
        return notifications.filter((n) => n.type === "mention")
      case "reactions":
        return notifications.filter((n) => n.type === "score")
      case "invites":
        return notifications.filter((n) => n.type === "page_invite")
      default:
        return notifications
    }
  }

  const filteredNotifications = filterNotifications(notifications, activeTab)

  const getTabCount = (type: string) => {
    return filterNotifications(notifications, type).length
  }

  
  return (
    <div className="w-full bg-background">
      {/* Mobile Activity Dropdown */}
      {isMobile && (
        <div className="px-2 py-3 border-b border-border">
          <Button
            variant="outline"
            className="w-auto h-10 px-3 bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:border-primary/90 rounded-full font-medium text-sm"
          >
            Activity
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Mark all as read button - only show if there are unread notifications */}
      {hasUnread && !isMobile && (
        <div className="flex justify-end p-4 border-b border-border">
          <Button
            onClick={onMarkAllAsRead}
            variant="ghost"
            size="sm"
            className="text-sm h-8 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className={`border-b border-border ${isMobile ? "px-1" : "px-4 lg:px-6"}`}>
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex h-auto p-0 gap-0 bg-transparent w-full min-w-max">
              <TabsTrigger
                value="all"
                className={`text-sm py-4 px-2 lg:px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground font-medium transition-colors whitespace-nowrap ${isMobile ? "text-xs px-1.5" : ""}`}
              >
                All
                {notifications.length > 0 && !isMobile && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs px-2 py-0.5 h-5 bg-muted text-muted-foreground font-normal"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className={`text-sm py-4 px-2 lg:px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground font-medium transition-colors whitespace-nowrap ${isMobile ? "text-xs px-1.5" : ""}`}
              >
                Comments
                {getTabCount("comments") > 0 && !isMobile && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs px-2 py-0.5 h-5 bg-muted text-muted-foreground font-normal"
                  >
                    {getTabCount("comments")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="mentions"
                className={`text-sm py-4 px-2 lg:px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground font-medium transition-colors whitespace-nowrap ${isMobile ? "text-xs px-1.5" : ""}`}
              >
                Mentions
                {getTabCount("mentions") > 0 && !isMobile && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs px-2 py-0.5 h-5 bg-muted text-muted-foreground font-normal"
                  >
                    {getTabCount("mentions")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="reactions"
                className={`text-sm py-4 px-2 lg:px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground font-medium transition-colors whitespace-nowrap ${isMobile ? "text-xs px-1.5" : ""}`}
              >
                Reactions
                {getTabCount("reactions") > 0 && !isMobile && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs px-2 py-0.5 h-5 bg-muted text-muted-foreground font-normal"
                  >
                    {getTabCount("reactions")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="linkups"
                className={`text-sm py-4 px-2 lg:px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground font-medium transition-colors whitespace-nowrap ${isMobile ? "text-xs px-1.5" : ""}`}
              >
                Linkups
                {getTabCount("linkups") > 0 && !isMobile && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs px-2 py-0.5 h-5 bg-muted text-muted-foreground font-normal"
                  >
                    {getTabCount("linkups")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className={`text-sm py-4 px-2 lg:px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground font-medium transition-colors whitespace-nowrap ${isMobile ? "text-xs px-1.5" : ""}`}
              >
                Tasks
                {getTabCount("tasks") > 0 && !isMobile && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs px-2 py-0.5 h-5 bg-muted text-muted-foreground font-normal"
                  >
                    {getTabCount("tasks")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="invites"
                className={`text-sm py-4 px-2 lg:px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground font-medium transition-colors whitespace-nowrap ${isMobile ? "text-xs px-1.5" : ""}`}
              >
                Invites
                {getTabCount("invites") > 0 && !isMobile && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs px-2 py-0.5 h-5 bg-muted text-muted-foreground font-normal"
                  >
                    {getTabCount("invites")}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {filteredNotifications.length > 0 ? (
            <div>
              {filteredNotifications.map((notification, index) => (
                <div key={notification._id}>
                  <LinkedInNotificationItem
                    notification={notification}
                    onRead={onReadNotification}
                  />
                  {index < filteredNotifications.length - 1 && (
                    <div className="border-b border-border" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 lg:p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">All caught up!</h4>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {activeTab === "all" ? "You have no notifications" : `No ${activeTab} notifications`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
