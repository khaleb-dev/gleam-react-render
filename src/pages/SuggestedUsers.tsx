"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LinkupButton } from "@/components/feed/LinkupButton"
import { useSuggestedUsers } from "@/hooks/useSuggestedUsers"

const SuggestedUsers: React.FC = () => {
  const navigate = useNavigate()
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, error } = useSuggestedUsers(limit, skip)

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`)
  }

  const handleLoadMore = () => {
    setSkip(skip + limit)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Loading suggested users...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-red-500">Error loading suggested users</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Suggested Users
          </h1>
          <p className="text-muted-foreground mt-2">Discover and connect with other community members</p>
        </div>

        {data?.data && data.data.length > 0 ? (
          <div className="flex flex-col gap-2">
            {data.data.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition cursor-pointer"
              >
                {/* Avatar */}
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                    alt={`${user.first_name} ${user.last_name}`}
                  />
                  <AvatarFallback>
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex flex-col text-sm leading-tight">
                  <span className="font-medium">
                    {user.first_name}_{user.last_name.toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.responder_id?.job_title || "Community Member"}
                  </span>
                  {user.responder_id?.rank_status && (
                    <span
                      className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full w-fit"
                      style={{
                        backgroundColor: user.responder_id.rank_status.rank_color + "20",
                        color: user.responder_id.rank_status.rank_color,
                      }}
                    >
                      {user.responder_id.rank_status.rank_name}
                    </span>
                  )}
                </div>

                {/* Follow Button */}
                <div className="ml-auto">
                  <LinkupButton userId={user.user_id} className="text-xs px-3 py-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suggested users found</h3>
            <p className="text-muted-foreground">
              We couldn't find any suggested users at the moment. Check back later!
            </p>
          </div>
        )}

        {data?.data && data.data.length === limit && (
          <div className="text-center mt-6">
            <Button onClick={handleLoadMore} variant="outline">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestedUsers
