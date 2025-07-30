import React from "react"
import { Plus } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface FeedActionButtonProps {
  onClick: () => void
}

export const FeedActionButton: React.FC<FeedActionButtonProps> = ({ onClick }) => {
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 200
      setIsVisible(scrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Show on all screen sizes when scrolled down
  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <button
        onClick={onClick}
        className="w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        title="Create Post"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}
