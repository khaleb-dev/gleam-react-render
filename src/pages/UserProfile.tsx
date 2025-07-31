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
import { useFeed } from "@/hooks/useFeed"

interface UserProfile {
  _id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  profile_avatar?: string
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
  const { getSuggestedPostsByUser } = useFeed()

  // Fetch user posts
  const { data: userPosts = [], isLoading: isLoadingPosts } = getSuggestedPostsByUser("", userId || "", {
    enabled: !!userId,
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return

      try {
        const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
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
  }, [userId])

  const handleMessage = () => {
    navigate(`/chat/user/${userId}`)
  }

  const isOwnProfile = currentUser && user && currentUser.user_id === user.user_id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl pt-6">
        <Card className="mb-6 overflow-hidden shadow-sm border-0 bg-white">
          <div className="relative h-32 md:h-40 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-beembyte-teal/20 to-beembyte-green/20"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            {isOwnProfile && (
              <Button size="sm" variant="secondary" className="absolute top-4 right-4 h-8 px-3">
                <Camera className="h-4 w-4 mr-2" />
                Edit cover
              </Button>
            )}
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 md:-mt-16">
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="relative mb-4 md:mb-0 self-start">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gray-100">
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-1 right-1 h-7 w-7 p-0 rounded-full"
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 md:pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h1>
                    {user.is_vetted && <Check className="h-6 w-6 text-beembyte-green" />}
                    <span className="text-sm font-normal text-primary">• 1st</span>
                  </div>
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    {user.responder_id?.job_title || "Professional"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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
                    <span className="text-gray-400">•</span>
                    <span className="text-primary hover:underline cursor-pointer font-medium">500+ linkups</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {/* {mockProfileData.mutualConnections.slice(0, 3).map((connection, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-white">
                          <AvatarFallback className="text-xs bg-primary text-white">{connection.avatar}</AvatarFallback>
                        </Avatar>
                      ))} */}
                    </div>
                    {/* <p className="text-sm text-gray-600">
                      <span className="font-medium">Sarah Johnson</span>, <span className="font-medium">Mike Chen</span>
                      , and <span className="font-medium">3 other mutual linkups</span>
                    </p> */}
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
                     <LinkupButton userId={user.user_id} />
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
            {isOwnProfile && (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profile completeness</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Skill endorsements</span>
                      <span className="font-medium">42</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10">
                      View detailed analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-primary hover:underline cursor-pointer">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{user.phone_number || "Not provided"}</span>
                </div>
                {user.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-primary hover:underline cursor-pointer">{user.website}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
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
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
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
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0 md:block">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">About {user.first_name}</h2>
                    <p className="text-gray-700 leading-relaxed">{user.bio || "No bio available"}</p>
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

            <div className="space-y-6">
              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
                      <p className="text-sm text-gray-600">Recent posts by {user.first_name}</p>
                    </div>
                  </div>

                  {isLoadingPosts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Loading posts...</p>
                    </div>
                  ) : userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.slice(0, 3).map((post: any) => (
                        <div
                          key={post._id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/feed/${post._id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                    user.first_name,
                                  )}`}
                                />
                                <AvatarFallback className="text-xs">
                                  {user.first_name[0]}
                                  {user.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {user.first_name} {user.last_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(post.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h4>
                          <p
                            className="text-gray-700 text-sm leading-relaxed mb-3 overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {post.description}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{post.total_score}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{post.comments_count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userPosts.length > 3 && (
                        <Button variant="ghost" className="w-full text-primary hover:bg-primary/10">
                          View all {userPosts.length} posts
                        </Button>
                      )}
                    </div>
                   ) : (
                     <div className="text-center py-8">
                       <div className="text-gray-400 text-4xl mb-3">📝</div>
                       <p className="text-gray-600">
                         {isOwnProfile
                           ? "You haven't posted anything yet."
                           : "No posts yet."}
                       </p>
                     </div>
                   )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                      <p className="text-sm text-gray-600">Professional background</p>
                    </div>
                  </div>

                  {user.professional_experiences && user.professional_experiences.length > 0 ? (
                    <div className="space-y-6">
                      {user.professional_experiences.map((exp, index) => (
                        <div key={index} className="relative">
                          {index !== user.professional_experiences.length - 1 && (
                            <div className="absolute left-6 top-12 w-px h-16 bg-gray-200 hidden md:block"></div>
                          )}
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                              <p className="text-primary font-medium">{exp.company}</p>
                              <p className="text-sm text-gray-500 mb-2">{exp.location}</p>
                              <p className="text-sm text-gray-500 mb-2">
                                {new Date(exp.start_date).toLocaleDateString()} -{" "}
                                {exp.is_current ? "Present" : new Date(exp.end_date).toLocaleDateString()}
                              </p>
                              <p className="text-gray-700 text-sm mb-3">{exp.description}</p>
                              {exp.tools && exp.tools.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {exp.tools.map((tool, toolIndex) => (
                                    <Badge key={toolIndex} variant="secondary" className="text-xs">
                                      {tool}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">💼</div>
                      <p className="text-gray-600">No work experience added yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                      <p className="text-sm text-gray-600">Academic background</p>
                    </div>
                  </div>

                  {user.education && user.education.length > 0 ? (
                    <div className="space-y-6">
                      {user.education.map((edu, index) => (
                        <div key={index} className="relative">
                          {index !== user.education.length - 1 && (
                            <div className="absolute left-6 top-12 w-px h-16 bg-gray-200 hidden md:block"></div>
                          )}
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-beembyte-green/10 rounded-lg flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-beembyte-green" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                              <p className="text-primary font-medium">
                                {edu.degree} in {edu.field_of_study}
                              </p>
                              <p className="text-sm text-gray-500 mb-2">
                                {edu.start_year} - {edu.end_year}
                              </p>
                              <p className="text-gray-700 text-sm">{edu.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">🎓</div>
                      <p className="text-gray-600">No education information added yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                      <p className="text-sm text-gray-600">Recognition and awards</p>
                    </div>
                  </div>

                  {user.achievements && user.achievements.length > 0 ? (
                    <div className="grid gap-4">
                      {user.achievements.map((achievement, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-yellow-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{achievement.title}</h5>
                            <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(achievement.date_awarded).toLocaleDateString()}
                            </p>
                            {achievement.link && (
                              <a
                                href={achievement.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View Certificate
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">🏆</div>
                      <p className="text-gray-600">No achievements added yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                      <p className="text-sm text-gray-600">Latest actions and updates</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                        />
                        <AvatarFallback className="text-xs">
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{user.first_name}</span> completed a task for{" "}
                          <span className="font-medium">Mobile App Development</span>
                        </p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                        />
                        <AvatarFallback className="text-xs">
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{user.first_name}</span> received a 5-star rating from{" "}
                          <span className="font-medium">Sarah Johnson</span>
                        </p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`}
                        />
                        <AvatarFallback className="text-xs">
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{user.first_name}</span> posted a new article about{" "}
                          <span className="font-medium">React Best Practices</span>
                        </p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 p-3">
            <LinkupButton userId={user.user_id} className="text-lg" />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
