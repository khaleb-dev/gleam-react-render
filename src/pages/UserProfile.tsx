"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  MessageCircle,
  Check,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Building,
  GraduationCap,
  Trophy,
  TrendingUp,
  Edit,
  Camera,
  Zap,
  ThumbsUp,
  MessageSquare,
  Briefcase,
  BookOpen,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LinkupButton } from "@/components/feed/LinkupButton"
import { LinkupCount } from "@/components/feed/LinkupCount"
import { useAuth } from "@/hooks/useAuth"
import { API_BASE_URL } from "@/config/env"
import { UserFeedSection } from "@/components/profile/UserFeedSection"

interface UserProfile {
  _id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  is_vetted: boolean
  responder_info?: {
    job_title: string
    years_of_experience: number
    skills: string[]
    rank_status: {
      rank_name: string
      rank_color: string
      min_tasks_completed: number
      min_rating: number
    }
    availability_status: string
  }
  created_at: string
  bio?: string
  phone_number?: string
  website?: string
  professional_experiences?: any[]
  education?: any[]
  achievements?: any[]
  responder_id?: {
    city: string
    state: string
    country: string
    skills: string[]
    job_title: string
  }
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { loggedInUser } = useAuth()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return

      try {
        const response = await fetch(`${API_BASE_URL}/users/get-user?userId=${userId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()
        if (data.success && data.data) {
          setUser(data.data)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCurrentUser = async () => {
      try {
        const userData = await loggedInUser()
        setCurrentUser(userData)
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchUserProfile()
    fetchCurrentUser()
  }, [userId, loggedInUser])

  const handleMessage = () => {
    navigate(`/chat/user/${userId}`)
  }

  const isOwnProfile = currentUser && user && currentUser.user_id === user.user_id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => navigate("/feed")} className="bg-primary hover:bg-primary/90">
            Back to Feed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-6xl pt-6">
        <Card className="mb-6 overflow-hidden shadow-sm border-0 bg-white dark:bg-gray-800">
          <div className="relative h-32 md:h-40 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-beembyte-teal/20 to-beembyte-green/20"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 md:-mt-16">
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="relative mb-4 md:mb-0 self-start">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                      alt={`${user.first_name} ${user.last_name}`}
                    />
                    <AvatarFallback className="text-2xl bg-gray-100">
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 md:pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </h1>
                    {user.is_vetted && <Check className="h-6 w-6 text-beembyte-green" />}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                    {user.responder_id?.job_title || "Professional"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.responder_id
                        ? `${user.responder_id.city}, ${user.responder_id.state}, ${user.responder_id.country}`
                        : "Location not specified"}
                    </div>
                    <button className="text-primary hover:underline font-medium">Contact info</button>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <LinkupCount
                      userId={user.user_id}
                      className="text-primary hover:underline cursor-pointer font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:pb-4">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={handleMessage}
                      className="bg-primary hover:bg-primary/90 text-white px-6"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-6 border-gray-300 hover:bg-gray-50 bg-transparent"
                    >
                      More
                    </Button>
                  </>
                )}

                {isOwnProfile && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    size="lg"
                    className="px-6 border-gray-300 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-primary hover:underline cursor-pointer">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{user.phone_number || "Not provided"}</span>
                </div>
                {user.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-primary hover:underline cursor-pointer">{user.website}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Joined{" "}
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {user.is_vetted && user.responder_info?.skills && user.responder_info.skills.length > 0 && (
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user.responder_info.skills.slice(0, 6).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                        >
                          {skill}
                        </Badge>
                        <span className="text-xs text-gray-500">+{Math.floor(Math.random() * 20) + 5}</span>
                      </div>
                    ))}
                    {user.responder_info.skills.length > 6 && (
                      <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10">
                        Show all {user.responder_info.skills.length} skills
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0 md:block">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About {user.first_name}</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.bio || "No bio available"}</p>
                    {user.responder_id?.skills && user.responder_id.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {user.responder_id.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <UserFeedSection userId={user.user_id} userName={`${user.first_name} ${user.last_name}`} />
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-3">
            <LinkupButton userId={user.user_id} className="text-lg" />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile