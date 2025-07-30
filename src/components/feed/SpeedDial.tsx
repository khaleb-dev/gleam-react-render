import React, { useState, useEffect } from "react"
import { Plus, FileText, CheckSquare } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CreatePostCard } from "./CreatePostCard"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import type { User } from "@/types"

interface SpeedDialProps {
  onPostCreate?: (postData: any) => Promise<void>
}

export const SpeedDial: React.FC<SpeedDialProps> = ({ onPostCreate }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()
  const { loggedInUser } = useAuth()

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await loggedInUser()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }
    fetchUser()
  }, [])

  // Show/hide speed dial based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 200
      setIsVisible(scrolled)
      if (!scrolled) {
        setIsExpanded(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleCreateTask = () => {
    navigate("/create-task")
    setIsExpanded(false)
  }

  const handleCreatePost = () => {
    setShowCreatePost(true)
    setIsExpanded(false)
  }

  const handlePostCreate = async (postData: any) => {
    await onPostCreate?.(postData)
    setShowCreatePost(false)
  }

  if (!isVisible || !user) return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Speed Dial Actions */}
        <div className={`absolute bottom-16 right-0 flex flex-col space-y-3 transition-all duration-300 ${isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}>
          {/* Create Task Button */}
          <button
            onClick={handleCreateTask}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-lg rounded-full px-4 py-3 hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
            title="Create Task"
          >
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Create Task</span>
          </button>

          {/* Create Post Button */}
          <button
            onClick={handleCreatePost}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-lg rounded-full px-4 py-3 hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
            title="Create Post"
          >
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Create Post</span>
          </button>
        </div>

        {/* Main Speed Dial Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${isExpanded ? "rotate-45" : ""
            }`}
          title="Quick Actions"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Create Post Modal - Opens directly */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-2xl">
          <CreatePostCard user={user} onPostCreate={handlePostCreate} />
        </DialogContent>
      </Dialog>
    </>
  )
}
