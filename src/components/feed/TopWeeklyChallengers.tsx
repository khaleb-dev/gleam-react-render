import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"
import { useChallengeStats } from "@/hooks/useChallengeStats"

export const TopWeeklyChallengers = () => {
  const navigate = useNavigate()
  const { data: challenges, isLoading } = useChallengeStats('beembyte_challenge', 1, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Top Weekly Challengers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center animate-pulse">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-8"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleItemClick = (feedId: string) => {
    navigate(`/feed/${feedId}`)
  }

  const handleNameClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation()
    navigate(`/profile/${userId}`)
  }

  const handleViewMore = () => {
    navigate('/top-weekly-challengers')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Top Weekly Challengers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {challenges?.slice(0, 5).map((challenge, index) => (
          <div
            key={challenge._id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleItemClick(challenge._id)}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {index + 1}
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={challenge.user.profile_avatar} />
                <AvatarFallback className="text-xs">
                  {challenge.user.first_name?.[0]}{challenge.user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span
                className="font-medium text-xs hover:text-primary cursor-pointer"
                onClick={(e) => handleNameClick(e, challenge.user_id)}
              >
                {challenge.user.first_name} {challenge.user.last_name}
              </span>
            </div>
            <span className="text-xs font-semibold text-primary">
              {challenge.total_score}
            </span>
          </div>
        ))}

        {challenges && challenges.length >= 5 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs hover:text-primary"
              onClick={handleViewMore}
            >
              View More
            </Button>
          </div>
        )}

        {(!challenges || challenges.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No challengers found
          </p>
        )}
      </CardContent>
    </Card>
  )
}
