import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { Header } from "./Header"
import { AppFooter } from "./AppFooter"
import { useAuthGuard } from "@/hooks/useAuthGuard"

type LayoutProps = {
  children: ReactNode
  requireAuth?: boolean
  showFooter?: boolean
}

export const Layout = ({ children, requireAuth = true, showFooter = true }: LayoutProps) => {
  // Use our new auth guard hook
  const { isAuthenticated } = useAuthGuard(requireAuth)
  const location = useLocation()

  // Check if current route is a chat route
  const isChatRoute = location.pathname.startsWith("/chat/")

  // Check if current route is the feed route
  const isFeedRoute = location.pathname === "/feed" || location.pathname.startsWith("/feed")
  const isMessageRoute = location.pathname === "/messages" || location.pathname.startsWith("/messages")


  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-beembyte-darkBlue">
      {
        isMessageRoute ? null :
          <Header />
      }

      <main className="flex-grow">
        <div
          className={`max-w-7xl mx-auto w-full ${isChatRoute
            ? ""
            : isFeedRoute
              ? "px-0 sm:px-6 lg:px-0 py-0" // No horizontal padding on mobile for feed
              : isMessageRoute ? ""
                : "px-1 sm:px-2 lg:px-8 py-1" // Normal padding for other routes
            }`}
        >
          {(!requireAuth || isAuthenticated) && children}
        </div>
      </main>
      {showFooter && !isMessageRoute && <AppFooter />}
    </div>
  )
}
