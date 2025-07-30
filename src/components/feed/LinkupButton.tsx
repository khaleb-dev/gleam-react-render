"use client"

import React from "react"
import { Plus, Check, Users } from "lucide-react"
import { useLinkup } from "@/hooks/useLinkup"
import { useAuth } from "@/hooks/useAuth"

interface LinkupButtonProps {
  userId: string
  className?: string
}

export const LinkupButton: React.FC<LinkupButtonProps> = ({ userId, className = "" }) => {
  const { status, linkup, unlinkup } = useLinkup(userId)
  const { loggedInUser } = useAuth()
  const [currentUser, setCurrentUser] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await loggedInUser()
        setCurrentUser(userData)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }
    fetchUser()
  }, [])

  // Don't show button for own profile
  if (currentUser && currentUser.user_id === userId) {
    return null
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (status.isLinkedUp) {
      await unlinkup()
    } else {
      await linkup()
    }
  }

  const getButtonContent = () => {
    if (status.isLoading) {
      return {
        text: "Loading...",
        icon: <Plus className="h-4 w-4" />,
        textColor: "text-muted-foreground",
      }
    }

    if (status.isMutual) {
      return {
        text: "Unlink",
        icon: <Users className="h-4 w-4" />,
        textColor: "text-primary hover:text-primary/80",
      }
    }

    if (status.isLinkedUp) {
      return {
        text: "Linked",
        icon: <Check className="h-4 w-4" />,
        textColor: "text-beembyte-green",
      }
    }

    return {
      text: "Linkup",
      icon: <Plus className="h-4 w-4" />,
      textColor: "text-primary hover:text-primary/80",
    }
  }

  const { text, icon, textColor } = getButtonContent()

  return (
    <button
      onClick={handleClick}
      disabled={status.isLoading}
      className={`flex items-center gap-1 ${textColor} hover:underline transition-colors ${className}`}
    >
      {icon}
      <span className="text-xs font-medium">{text}</span>
    </button>
  )
}
