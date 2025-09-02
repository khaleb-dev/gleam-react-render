import { useLocation, useNavigate } from "react-router-dom"
import { Home, MessageCircle, Bell, LayoutDashboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/useNotifications"
import { useMessageUnread } from "@/hooks/useMessageUnread"
import { useQueryClient } from "@tanstack/react-query"

export const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { unreadCount } = useNotifications()
  const { unreadCount: messageUnreadCount } = useMessageUnread()

  const handleFeedNavigation = () => {
    if (location.pathname === '/feed') {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/feed')
    }
  }

  const navItems = [
    { 
      label: "Feed", 
      path: "/feed", 
      icon: Home, 
      onClick: handleFeedNavigation,
      badgeCount: 0
    },
    { 
      label: "Messages", 
      path: "/messages", 
      icon: MessageCircle, 
      onClick: () => navigate("/messages"),
      badgeCount: messageUnreadCount
    },
    { 
      label: "Notifications", 
      path: "/notifications", 
      icon: Bell, 
      onClick: () => navigate("/notifications"),
      badgeCount: unreadCount
    },
    { 
      label: "Dashboard", 
      path: "/dashboard", 
      icon: LayoutDashboard, 
      onClick: () => navigate("/dashboard"),
      badgeCount: 0
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-beembyte-darkBlue border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.path || 
            (item.path === '/feed' && location.pathname === '/')
          
          return (
            <button
              key={item.path}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-2"
            >
              <div className={`relative flex items-center justify-center w-6 h-6 mb-1 transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}>
                <IconComponent className="h-5 w-5" />
                {item.badgeCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badgeCount > 9 ? "9+" : item.badgeCount}
                  </Badge>
                )}
              </div>
              <span className={`text-xs transition-colors ${
                isActive 
                  ? 'text-primary font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}