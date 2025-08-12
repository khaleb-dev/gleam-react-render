import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Info } from "lucide-react"
import { useChallenge } from "@/hooks/useChallenge"
import { ChallengeModal } from "./ChallengeModal"
import { useState } from "react"

export const ChallengeCard = () => {
  const { data: challenge, isLoading } = useChallenge()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <Card className="w-full mb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!challenge) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Truncate description to limited words (around 15-20 words)
  const truncateDescription = (text: string, wordLimit: number = 18) => {
    const words = text.split(' ')
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(' ') + '...'
  }

  return (
    <>
      <Card className="w-full mb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold text-primary">
                Active Challenge
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Started {formatDate(challenge.createdAt)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {challenge.banner && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={challenge.banner}
                alt={challenge.challenge_title}
                className="w-full h-32 object-cover"
              />
            </div>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {challenge.challenge_title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {truncateDescription(challenge.description)}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground pb-1">
            <Users className="h-3 w-3" />
            <span>Open to everyone</span>
          </div>
          <div className="flex items-center justify-between">

            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Info className="h-3 w-3 mr-1" />
              More Information
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Modal */}
      {challenge && (
        <ChallengeModal
          challenge={challenge}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
