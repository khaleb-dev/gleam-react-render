import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X, Minus } from "lucide-react"
import { useFeed } from "@/hooks/useFeed"

interface ScoreModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  currentUserScore?: number
  hasScored: boolean
  onOptimisticUpdate?: (scoreChange: number, peopleChange: number, hasScored?: boolean) => void
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  postId,
  currentUserScore = 0,
  hasScored = false,
  onOptimisticUpdate
}) => {
  const [userScore, setUserScore] = useState<number[]>([hasScored ? currentUserScore : 0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const { scorePost, unscorePost, getPeopleScored } = useFeed()

  // Fetch people who scored this post
  const { data: peopleData, isLoading: peopleLoading } = getPeopleScored(postId)

  const handleScoreSubmit = async () => {
    if (userScore[0] === 0) return

    setIsSubmitting(true)
    
    // Calculate the actual score change
    const newScore = userScore[0]
    const scoreChange = hasScored ? newScore - currentUserScore : newScore
    const peopleChange = hasScored ? 0 : 1
    
    // Optimistic update
    onOptimisticUpdate?.(scoreChange, peopleChange, true)
    
    try {
      await scorePost({ postId, payload: { score: userScore[0] } })
      onClose()
    } catch (error) {
      console.error("Failed to submit score:", error)
      // Revert optimistic update on error
      onOptimisticUpdate?.(-scoreChange, -peopleChange, hasScored)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnscore = async () => {
    setIsSubmitting(true)
    
    // Calculate the actual score change when removing score
    const scoreDecrease = -currentUserScore
    const peopleDecrease = -1
    
    // Optimistic update
    onOptimisticUpdate?.(scoreDecrease, peopleDecrease, false)
    
    try {
      await unscorePost(postId)
      setUserScore([0])
      onClose()
    } catch (error) {
      console.error("Failed to remove score:", error)
      // Revert optimistic update on error
      onOptimisticUpdate?.(-scoreDecrease, -peopleDecrease, true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center justify-between text-center">
            <span className="flex-1 text-lg font-semibold">People who reacted</span>
          </DialogTitle>
        </DialogHeader>

        {/* Reaction Tabs */}
        <div className="px-4 pb-3">
          <div className="flex space-x-6 text-sm">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2 border-b-2 transition-colors ${activeTab === "all"
                ? "border-blue-500 text-blue-600 font-medium"
                : "border-transparent text-gray-500"
                }`}
            >
              All {peopleData?.total_people}
            </button>
            <button
              onClick={() => setActiveTab("scores")}
              className={`flex items-center space-x-1 pb-2 border-b-2 transition-colors ${activeTab === "scores"
                ? "border-blue-500 text-blue-600 font-medium"
                : "border-transparent text-gray-500"
                }`}
            >
              <span>⭐</span>
              <span>{peopleData?.total_score || 0}</span>
            </button>
          </div>
        </div>

        {/* Score Slider - Only show if user hasn't scored yet */}
        {!hasScored && (
          <div className="px-4 pb-4 border-b border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Score</span>
                <span className="text-sm text-muted-foreground">{userScore[0]}/10</span>
              </div>
              <Slider
                value={userScore}
                onValueChange={setUserScore}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleScoreSubmit}
                  disabled={userScore[0] === 0 || isSubmitting}
                  className="flex-1 h-8 text-xs"
                  size="sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Score"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Unscore Button - Only show if user has scored */}
        {hasScored && (
          <div className="px-4 pb-4 border-b border-gray-200">
            <Button
              variant="outline"
              onClick={handleUnscore}
              disabled={isSubmitting}
              className="w-full h-8 text-xs flex items-center justify-center space-x-1"
              size="sm"
            >
              <Minus className="h-3 w-3" />
              <span>Remove Score</span>
            </Button>
          </div>
        )}

        {/* People List */}
        <div className="max-h-80 overflow-y-auto">
          {peopleLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : (
            peopleData?.users?.map((user) => (
              <div key={user._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                      alt={`${user.first_name} ${user.last_name}`}
                    />
                    <AvatarFallback className="text-xs">
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-xs text-gray-900 dark:text-gray-100">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{user.score}</span>
                </div>
              </div>
            )) || <div className="p-4 text-center text-sm text-gray-500">No scores yet</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
