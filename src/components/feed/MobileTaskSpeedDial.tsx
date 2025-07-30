import React, { useState, useEffect } from "react"
import { Edit3 } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"

export const MobileTaskSpeedDial: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const hasAuthCookie = document.cookie.includes("authToken=")
      const storedUser = localStorage.getItem("authorizeUser")
      setIsAuthenticated(hasAuthCookie && !!storedUser)
    }

    checkAuth()
    // Check periodically for auth changes
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  // Show/hide speed dial based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 200
      setIsVisible(scrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleCreateTask = () => {
    navigate("/create-task")
  }

  // Only show on mobile, when authenticated, when scrolled, and NOT on feed pages
  const isOnFeedPage = location.pathname.startsWith('/feed')
  if (!isMobile || !isAuthenticated || !isVisible || isOnFeedPage) return null

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <button
        onClick={handleCreateTask}
        className="w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        title="Create Task"
      >
        <Edit3 className="h-5 w-5" />
      </button>
    </div>
  )
}
