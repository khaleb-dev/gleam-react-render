"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Bell, MessageCircle, UserIcon, Home, LayoutDashboard, ClipboardList, Hash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useNotifications } from "@/hooks/useNotifications"
import { useMessageUnread } from "@/hooks/useMessageUnread"
import { SearchBar } from "./SearchBar"
import type { User as UserType } from "@/types"
import { useQueryClient } from "@tanstack/react-query"

export const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { isLoading: userLoading, loggedInUser, logout } = useAuth()
  const [user, setUser] = useState<UserType>(null)
  const { unreadCount } = useNotifications()
  const { unreadCount: messageUnreadCount } = useMessageUnread()

  const handleFeedNavigation = () => {
    if (location.pathname === '/feed') {
      // If already on feed page, refresh the feed and scroll to top
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Navigate to feed page
      navigate('/feed')
    }
  }

  useEffect(() => {
    let isMounted = true
    let hasFetched = false

    const setLoggedInUser = async () => {
      if (!hasFetched) {
        hasFetched = true
        try {
          const userFromStorage = await loggedInUser()
          if (userFromStorage && isMounted) {
            setUser(userFromStorage)
          }
        } catch (error) {
          console.error("Error fetching user:", error)
        }
      }
    }

    setLoggedInUser()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array to prevent infinite requests

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Generate a Dicebear URL using the user's first name as the seed
  const dicebearUrl = user?.profile_avatar ? user?.profile_avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.first_name)}`

  const menuItems = [
    { label: "Explore", path: "/feed", icon: Home, onClick: handleFeedNavigation },
    { label: "Discover", path: "/discover", icon: Hash, onClick: () => navigate("/discover") },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, onClick: () => navigate("/dashboard") },
    { label: "Task History", path: "/task-history", icon: ClipboardList, onClick: () => navigate("/task-history") },
  ]

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-beembyte-darkBlue border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 h-14">
        {/* Left Section - Logo and Search */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <img
              src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
              alt="beembyte"
              className="h-8 w-auto mr-2 invert dark:invert-0"
            />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              <span className="hidden sm:inline">beembyte</span>
            </h1>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block ml-4">
            <SearchBar />
          </div>
        </div>

        {/* Center Section - Navigation Items (Hidden on mobile) */}
        <div className="hidden lg:flex items-center space-x-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.path}
                onClick={item.onClick}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                title={item.label}
              >
                <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            );
          })}
        </div>

        {/* Right Section - Icons and User Menu */}
        <div className="flex items-center space-x-6">
          {/* Search for Mobile */}
          <div className="md:hidden">
            <SearchBar />
          </div>

          {/* Messages Icon */}
          {!userLoading && user && (
            <div className="relative">
              <button
                onClick={() => navigate("/messages")}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {messageUnreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {messageUnreadCount > 9 ? "9+" : messageUnreadCount}
                  </Badge>
                )}
              </button>
            </div>
          )}

          {/* Notifications Icon */}
          {!userLoading && user && (
            <div className="relative">
              <button
                onClick={() => navigate("/notifications")}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          )}

          {/* User Menu - Desktop */}
          {!userLoading && user ? (
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profile_avatar || dicebearUrl || "/placeholder.svg"}
                        alt={user.first_name}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          console.error("Failed to load dicebear image in header:", dicebearUrl)
                        }}
                      />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {user.first_name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="text-sm">
                    <UserIcon size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wallet")} className="text-sm">
                    <span className="mr-2">💰</span>Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/task-history")} className="text-sm">
                    <span className="mr-2">📋</span>Task History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/company")} className="text-sm">
                    <span className="mr-2">🏢</span>For Company
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-sm">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}

          {/* Mobile Menu - Only Profile Avatar */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                {!userLoading && user && (
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage
                      src={dicebearUrl || "/placeholder.svg"}
                      alt={user.first_name}
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        console.error("Failed to load dicebear image in mobile header:", dicebearUrl)
                      }}
                    />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {user.first_name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <div className="py-6">
                  <div className="flex items-center mb-6">
                    <img
                      src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
                      alt="beembyte"
                      className="h-7 w-auto mr-2 invert dark:invert-0"
                    />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">beembyte</h2>
                  </div>

                  {/* User Info */}
                  {!userLoading && user && (
                    <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.profile_avatar ? user.profile_avatar : dicebearUrl || "/placeholder.svg"}
                          alt={user.first_name}
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            console.error("Failed to load dicebear image in mobile sheet:", dicebearUrl)
                          }}
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {user.first_name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  )}

                  <nav className="flex flex-col space-y-4">
                    {menuItems.map((item) => (
                      <button
                        key={item.path}
                        className="text-gray-600 hover:text-primary text-left py-2 text-sm"
                        onClick={item.onClick}
                      >
                        {item.label}
                      </button>
                    ))}

                    {!userLoading && user && (
                      <>
                        <button
                          className="text-gray-600 hover:text-primary text-left py-2 text-sm flex items-center gap-2"
                          onClick={() => navigate("/messages")}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Messages
                          {messageUnreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-4 w-4 flex items-center justify-center p-0 text-xs"
                            >
                              {messageUnreadCount > 9 ? "9+" : messageUnreadCount}
                            </Badge>
                          )}
                        </button>
                        <button
                          className="text-gray-600 hover:text-primary text-left py-2 text-sm flex items-center gap-2"
                          onClick={() => navigate("/notifications")}
                        >
                          <Bell className="h-4 w-4" />
                          Notifications
                          {unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-4 w-4 flex items-center justify-center p-0 text-xs"
                            >
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                          )}
                        </button>
                        <button
                          className="text-gray-600 hover:text-primary text-left py-2 text-sm"
                          onClick={() => navigate("/profile")}
                        >
                          Profile
                        </button>
                        <button
                          className="text-gray-600 hover:text-primary text-left py-2 text-sm"
                          onClick={() => navigate("/wallet")}
                        >
                          💰 Wallet
                        </button>
                        <button
                          className="text-gray-600 hover:text-primary text-left py-2 text-sm"
                          onClick={() => navigate("/company")}
                        >
                          🏢 For Company
                        </button>

                        <button
                          className="text-red-600 hover:text-red-700 text-left py-2 text-sm"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2 inline" />
                          Logout
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
