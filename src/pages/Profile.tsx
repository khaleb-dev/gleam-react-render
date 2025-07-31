"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
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
  Plus,
  DollarSign,
  Star,
  Trash2,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LinkupCount } from "@/components/feed/LinkupCount"
import { useAuth } from "@/hooks/useAuth"
import { useFeed } from "@/hooks/useFeed"
import { ExperienceModal } from "@/components/profile/ExperienceModal"
import { EducationModal } from "@/components/profile/EducationModal"
import { AchievementModal } from "@/components/profile/AchievementModal"
import { ActivityFeed } from "@/components/profile/ActivityFeed"
import { profileApiService } from "@/services/profileApi"
import { toast } from "sonner"
import { userApiService } from "@/services/userApi"
import { API_BASE_URL } from "@/config/env"
import { useSingleFileUpload } from "@/hooks/useSingleFileUpload"
import { useNotifications } from "@/hooks/useNotifications"

const Profile = () => {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<any>(null)
  const [experienceModalOpen, setExperienceModalOpen] = useState(false)
  const [educationModalOpen, setEducationModalOpen] = useState(false)
  const [achievementModalOpen, setAchievementModalOpen] = useState(false)
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null)
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null)
  const { loggedInUser } = useAuth()
  const { getSuggestedPostsByUser } = useFeed()
  const { uploadFile, isUploading: isUploadingFile } = useSingleFileUpload()
  const { activities } = useNotifications()

  // Check if viewing own profile or other user's profile
  const isOwnProfile = !userId

  // Fetch user posts
  const { data: userPosts = [], isLoading: isLoadingPosts } = getSuggestedPostsByUser("", user?.user_id || user?._id || "", {
    enabled: !!user?.user_id || !!user?._id,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Always fetch current user data first
        const currentUserData = await loggedInUser()
        setCurrentUser(currentUserData)

        if (userId) {
          // Viewing another user's profile
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
            setEditedUser(data.data)
          }
        } else {
          // Viewing own profile
          if (currentUserData) {
            // Fetch complete user profile with all sections
            const profileResponse = await userApiService.getUserProfile()
            if (profileResponse.success) {
              setUser(profileResponse.data)
              setEditedUser(profileResponse.data)
            } else {
              setUser(currentUserData)
              setEditedUser(currentUserData)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const handleProfileUpdate = (newUserData: any) => {
    setUser(newUserData)
    setEditedUser(newUserData)
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedUser(user) // Reset changes
      setSelectedProfileImage(null)
      setSelectedCoverImage(null)
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedUser((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedProfileImage(file)
    }
  }

  const handleCoverImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedCoverImage(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      let profileAvatarUrl = editedUser.profile_avatar
      let coverAvatarUrl = editedUser.cover_avatar

      // Upload profile image if selected
      if (selectedProfileImage) {
        const profileUploadResult = await uploadFile(selectedProfileImage)
        if (profileUploadResult) {
          profileAvatarUrl = profileUploadResult
        } else {
          toast.error("Failed to upload profile image")
          return
        }
      }

      // Upload cover image if selected
      if (selectedCoverImage) {
        const coverUploadResult = await uploadFile(selectedCoverImage)
        if (coverUploadResult) {
          coverAvatarUrl = coverUploadResult
        } else {
          toast.error("Failed to upload cover image")
          return
        }
      }

      const payload = {
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        phone_number: editedUser.phone_number,
        bio: editedUser.bio,
        profile_avatar: profileAvatarUrl,
        cover_avatar: coverAvatarUrl,
        website: editedUser.website,
        education: editedUser.education || [],
        professional_experiences: editedUser.professional_experiences || [],
        achievements: editedUser.achievements || [],
      }

      const response = await fetch(`${API_BASE_URL}/users/edit-profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.data)
        setEditedUser(result.data)
        setIsEditing(false)
        setSelectedProfileImage(null)
        setSelectedCoverImage(null)
        toast.success("Profile updated successfully!")
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("An error occurred while updating profile")
    }
  }

  const handleDeleteItem = async (itemId: string, type: "experience" | "education" | "achievement") => {
    try {
      let response
      switch (type) {
        case "experience":
          response = await profileApiService.deleteExperience({ index: itemId })
          break
        case "education":
          response = await profileApiService.deleteEducation({ index: itemId })
          break
        case "achievement":
          response = await profileApiService.deleteAchievement({ index: itemId })
          break
      }

      if (response?.success) {
        toast.success(`${type} deleted successfully`)
        // Refresh user data
        const profileResponse = await userApiService.getUserProfile()
        if (profileResponse.success) {
          setUser(profileResponse.data)
          setEditedUser(profileResponse.data)
        }
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      toast.error(`Failed to delete ${type}`)
    }
  }

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
          <p className="text-muted-foreground mb-4">Unable to load profile</p>
          <Button onClick={() => navigate("/feed")} className="bg-primary hover:bg-primary/90">
            Back to Feed
          </Button>
        </div>
      </div>
    )
  }

  const displayUser = isEditing ? editedUser : user

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-2 max-w-7xl pt-6">
        {/* Earn as Responder Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary to-beembyte-teal text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Earn as a Responder on BeemByte</h3>
                  <p className="text-sm opacity-90">
                    Join thousands of professionals earning money by completing tasks
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100 hidden sm:flex">
                <Star className="h-4 w-4 mr-2" />
                Get Started
              </Button>
              <Button variant="secondary" size="sm" className="bg-white text-primary hover:bg-gray-100 sm:hidden">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 overflow-hidden shadow-sm border-0 bg-white">
          <div
            className="relative h-40 md:h-48 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
            style={{
              backgroundImage: selectedCoverImage
                ? `url(${URL.createObjectURL(selectedCoverImage)})`
                : displayUser.cover_avatar
                  ? `url(${displayUser.cover_avatar})`
                  : `url(https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
                    displayUser.last_name || displayUser.first_name || "cover"
                  )}&backgroundColor=2563eb,7c3aed,dc2626,ea580c,16a34a)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!displayUser.cover_avatar && !selectedCoverImage && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-beembyte-teal/20 to-beembyte-green/20"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageSelect}
              className="hidden"
              id="cover-image-input"
            />
            {isOwnProfile && isEditing && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 h-8 px-2 sm:px-3"
                onClick={() => document.getElementById("cover-image-input")?.click()}
              >
                <Camera className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit cover</span>
              </Button>
            )}
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20">
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="relative mb-4 md:mb-0 self-start">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={
                        selectedProfileImage
                          ? URL.createObjectURL(selectedProfileImage)
                          : displayUser.profile_avatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayUser.first_name || "User")}`
                      }
                      alt={`${displayUser.first_name} ${displayUser.last_name}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg sm:text-2xl bg-gray-100">
                      {displayUser.first_name?.[0] || "U"}
                      {displayUser.last_name?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageSelect}
                    className="hidden"
                    id="profile-image-input"
                  />
                  {isOwnProfile && isEditing && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-1 right-1 h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full"
                      onClick={() => document.getElementById("profile-image-input")?.click()}
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 md:pb-4 mt-6 lg:mt-[70px]">
                  <div className="flex items-center gap-2 mb-2">
                    {isEditing ? (
                      <div className="flex gap-2 flex-wrap">
                        <Input
                          value={displayUser.first_name}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          className="text-xl font-bold flex-1 min-w-[140px]"
                          placeholder="First Name"
                        />
                        <Input
                          value={displayUser.last_name}
                          onChange={(e) => handleInputChange("last_name", e.target.value)}
                          className="text-xl font-bold flex-1 min-w-[140px]"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {displayUser.first_name} {displayUser.last_name}
                      </h1>
                    )}
                    {displayUser.is_verified && <Check className="h-5 w-5 sm:h-6 sm:w-6 text-beembyte-green" />}
                    {/* <span className="text-xs sm:text-sm font-normal text-primary">• 1st</span> */}
                  </div>
                  <p className="text-sm sm:text-lg font-medium mb-2 text-gray-700">
                    {displayUser.responder_id?.job_title || "Professional"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      {displayUser.responder_id?.country &&
                        displayUser.responder_id?.state &&
                        displayUser.responder_id?.city
                        ? `${displayUser.responder_id.city}, ${displayUser.responder_id.state}, ${displayUser.responder_id.country}`
                        : "Location not set"}
                    </div>
                    <button className="text-primary hover:underline font-medium">Contact info</button>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                    <LinkupCount
                      userId={displayUser.user_id}
                      className="text-primary hover:underline cursor-pointer font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm mb-4">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <span className="text-gray-700">
                      Joined{" "}
                      {new Date(displayUser.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 md:pb-4">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      size="sm"
                      className="px-3 sm:px-6 bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleEditToggle}
                      size="sm"
                      className="px-3 sm:px-6 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm bg-transparent"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Cancel</span>
                      <span className="sm:hidden">Cancel</span>
                    </Button>
                  </>
                ) : (
                  isOwnProfile && (
                    <Button
                      variant="outline"
                      onClick={handleEditToggle}
                      size="sm"
                      className="px-3 sm:px-6 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm bg-transparent"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="text-primary hover:underline cursor-pointer break-all">{displayUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  {isEditing ? (
                    <Input
                      value={displayUser.phone_number || ""}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      className="text-xs sm:text-sm h-6 px-2"
                      placeholder="Phone number"
                    />
                  ) : (
                    <span className="text-gray-700">{displayUser.phone_number || "Not provided"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  {isEditing ? (
                    <Input
                      value={displayUser.website || ""}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="text-xs sm:text-sm h-6 px-2"
                      placeholder="Website URL"
                    />
                  ) : (
                    <span className="text-primary hover:underline cursor-pointer break-all">
                      {displayUser.website || "Not provided"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Profile views</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Profile completeness</span>
                    <span className="font-medium">
                      {Math.round(
                        (((displayUser.bio ? 1 : 0) +
                          (displayUser.professional_experiences?.length > 0 ? 1 : 0) +
                          (displayUser.education?.length > 0 ? 1 : 0) +
                          (displayUser.achievements?.length > 0 ? 1 : 0)) /
                          4) *
                        100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (((displayUser.bio ? 1 : 0) +
                        (displayUser.professional_experiences?.length > 0 ? 1 : 0) +
                        (displayUser.education?.length > 0 ? 1 : 0) +
                        (displayUser.achievements?.length > 0 ? 1 : 0)) /
                        4) *
                      100,
                    )}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {displayUser.responder_id?.skills && displayUser.responder_id.skills.length > 0 && (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {displayUser.responder_id.skills.slice(0, 6).map((skill: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            {(displayUser.bio || isEditing) && (
              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">About</h2>
                    </div>
                    <div className="w-full">
                      {isEditing ? (
                        <Textarea
                          value={displayUser.bio || ""}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          className="text-gray-700 leading-relaxed text-sm sm:text-base min-h-[100px]"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                          {displayUser.bio || "No bio provided."}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Posts</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Your recent posts</p>
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
                                src={
                                  displayUser.profile_avatar ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                    displayUser.first_name || "User",
                                  )}`
                                }
                              />
                              <AvatarFallback className="text-xs">
                                {displayUser.first_name?.[0] || "U"}
                                {displayUser.last_name?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {displayUser.first_name} {displayUser.last_name}
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
                    <p className="text-gray-600">You haven't posted anything yet.</p>
                    <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => navigate("/feed")}>
                      Create your first post
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Experience</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Professional background</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExperienceModalOpen(true)}
                      className="p-2 sm:px-3 sm:py-2"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add Experience</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {displayUser.professional_experiences?.map((exp: any, index: number) => (
                    <div key={exp._id} className="relative">
                      {index !== displayUser.professional_experiences?.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-16 bg-gray-200"></div>
                      )}
                      <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
                        <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{exp.title}</h4>
                              <p className="text-primary font-medium text-sm">{exp.company}</p>
                              <p className="text-xs sm:text-sm text-gray-500 mb-2">
                                {new Date(exp.start_date).getFullYear()} -{" "}
                                {exp.is_current ? "Present" : new Date(exp.end_date).getFullYear()}
                                {exp.location && ` • ${exp.location}`}
                              </p>
                              <p className="text-gray-700 text-xs sm:text-sm mb-3">{exp.description}</p>
                              {exp.tools && exp.tools.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {exp.tools.map((tool: string, toolIndex: number) => (
                                    <Badge key={toolIndex} variant="secondary" className="text-xs">
                                      {tool}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {isOwnProfile && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(exp._id, "experience")}
                                className="p-2"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!displayUser.professional_experiences || displayUser.professional_experiences.length === 0) && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">💼</div>
                      <p className="text-gray-600 mb-4">No experience added yet.</p>
                      <Button onClick={() => setExperienceModalOpen(true)} variant="outline" size="sm">
                        Add your first experience
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Education</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Academic background</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEducationModalOpen(true)}
                      className="p-2 sm:px-3 sm:py-2"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add Education</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {displayUser.education?.map((edu: any, index: number) => (
                    <div key={edu._id} className="relative">
                      {index !== displayUser.education?.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-16 bg-gray-200"></div>
                      )}
                      <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
                        <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-beembyte-green/10 rounded-lg flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-beembyte-green" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{edu.institution}</h4>
                              <p className="text-primary font-medium text-sm">{edu.degree}</p>
                              <p className="text-xs sm:text-sm text-gray-500 mb-2">
                                {edu.field_of_study} • {edu.start_year} - {edu.end_year}
                              </p>
                              <p className="text-gray-700 text-xs sm:text-sm">{edu.description}</p>
                            </div>
                            {isOwnProfile && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(edu._id, "education")}
                                className="p-2"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!displayUser.education || displayUser.education.length === 0) && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">🎓</div>
                      <p className="text-gray-600 mb-4">No education added yet.</p>
                      <Button onClick={() => setEducationModalOpen(true)} variant="outline" size="sm">
                        Add your first education
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Achievements</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Recognition and awards</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAchievementModalOpen(true)}
                      className="p-2 sm:px-3 sm:py-2"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add Achievement</span>
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  {displayUser.achievements?.map((achievement: any, index: number) => (
                    <div
                      key={achievement._id}
                      className="space-y-3 sm:space-y-0 sm:flex sm:gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{achievement.title}</h5>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">{achievement.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(achievement.date_awarded).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
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
                          {isOwnProfile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(achievement._id, "achievement")}
                              className="p-2"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!displayUser.achievements || displayUser.achievements.length === 0) && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">🏆</div>
                      <p className="text-gray-600 mb-4">No achievements added yet.</p>
                      <Button onClick={() => setAchievementModalOpen(true)} variant="outline" size="sm">
                        Add your first achievement
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - User Activity */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {isOwnProfile && (
              <ActivityFeed activities={activities} />
            )}

            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayUser.responder_id && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Tasks completed</span>
                    <span className="font-medium">0</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Posts created</span>
                  <span className="font-medium">{userPosts.length}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Profile views</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Linkups</span>
                  <span className="font-medium">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals - Only for own profile */}
      {isOwnProfile && (
        <>
          <ExperienceModal
            open={experienceModalOpen}
            onOpenChange={setExperienceModalOpen}
            onSuccess={handleProfileUpdate}
          />
          <EducationModal open={educationModalOpen} onOpenChange={setEducationModalOpen} onSuccess={handleProfileUpdate} />
          <AchievementModal
            open={achievementModalOpen}
            onOpenChange={setAchievementModalOpen}
            onSuccess={handleProfileUpdate}
          />
        </>
      )}
    </div>
  )
}

export default Profile
