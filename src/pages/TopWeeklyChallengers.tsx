import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useChallengeStats } from "@/hooks/useChallengeStats"
import { Layout } from "@/components/layout/Layout"

export default function TopWeeklyChallengers() {
  const navigate = useNavigate()
  const { data: challenges, isLoading } = useChallengeStats('beembyte_challenge', 1, 50)

  const handleItemClick = (feedId: string) => {
    navigate(`/feed/${feedId}`)
  }

  const handleNameClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation()
    navigate(`/profile/${userId}`)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Top Weekly Challengers</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Challenge Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-muted rounded"></div>
                      <div className="h-5 bg-muted rounded w-32"></div>
                    </div>
                    <div className="h-5 bg-muted rounded w-12"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {challenges?.map((challenge, index) => (
                  <div
                    key={challenge._id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(challenge._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {index + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=40&h=40&fit=crop&crop=face`} />
                        <AvatarFallback className="text-sm">
                          {challenge.user.first_name?.[0]}{challenge.user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="font-medium hover:text-primary cursor-pointer"
                        onClick={(e) => handleNameClick(e, challenge.user_id)}
                      >
                        {challenge.user.first_name} {challenge.user.last_name}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-primary">
                      {challenge.total_score}
                    </span>
                  </div>
                ))}
                
                {(!challenges || challenges.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No challengers found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
