"use client"

import type React from "react"
import { useState } from "react"
import { ImageIcon, Plus, Video, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFeed } from "@/hooks/useFeed"
import { useFileUpload } from "@/hooks/useFileUpload"
import type { User } from "@/types"

interface CreatePostCardProps {
  user: User
  onPostCreate: (postData: any) => Promise<void>
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({ user, onPostCreate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as string[],
    videos: [] as string[],
    category: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isCreating } = useFeed()
  const { uploadFiles, isUploading } = useFileUpload()

  const dicebearUrl = user.first_name
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.first_name)}`
    : "https://api.dicebear.com/7.x/bottts/svg?seed=youruser"

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      const newImagePreviews: string[] = []

      newFiles.forEach((file) => {
        newImagePreviews.push(URL.createObjectURL(file))
      })

      setImageFiles([...imageFiles, ...newFiles])
      setImagePreviews([...imagePreviews, ...newImagePreviews])
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      const newVideoPreviews: string[] = []

      newFiles.forEach((file) => {
        newVideoPreviews.push(URL.createObjectURL(file))
      })

      setVideoFiles([...videoFiles, ...newFiles])
      setVideoPreviews([...videoPreviews, ...newVideoPreviews])
    }
  }

  const removeImage = (indexToRemove: number) => {
    const updatedFiles = [...imageFiles]
    updatedFiles.splice(indexToRemove, 1)
    const updatedImagePreviews = [...imagePreviews]
    updatedImagePreviews.splice(indexToRemove, 1)
    setImageFiles(updatedFiles)
    setImagePreviews(updatedImagePreviews)
  }

  const removeVideo = (indexToRemove: number) => {
    const updatedFiles = [...videoFiles]
    updatedFiles.splice(indexToRemove, 1)
    const updatedVideoPreviews = [...videoPreviews]
    updatedVideoPreviews.splice(indexToRemove, 1)
    setVideoFiles(updatedFiles)
    setVideoPreviews(updatedVideoPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      setUploadProgress(20)

      // Upload images first if any
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadFiles(imageFiles)
        if (uploadedUrls) {
          imageUrls = uploadedUrls
        }
      }

      setUploadProgress(60)

      // Upload videos if any
      let videoUrls: string[] = []
      if (videoFiles.length > 0) {
        const uploadedUrls = await uploadFiles(videoFiles)
        if (uploadedUrls) {
          videoUrls = uploadedUrls
        }
      }

      setUploadProgress(90)

      const postData = {
        title: formData.title,
        description: formData.description,
        images: imageUrls,
        videos: videoUrls,
        category: formData.category || "other",
        tags: formData.tags,
      }

      // Close modal immediately and show uploading state
      setIsModalOpen(false)

      await onPostCreate(postData)

      setUploadProgress(100)

      // Reset form
      setFormData({
        title: "",
        description: "",
        images: [],
        videos: [],
        category: "",
        tags: [],
      })
      setTagInput("")
      setImagePreviews([])
      setImageFiles([])
      setVideoPreviews([])
      setVideoFiles([])
      setUploadProgress(0)
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* New Trigger Card Design */}
      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
        <div
          className="p-4 sm:p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-white dark:border-gray-800">
                  <AvatarImage src={user.profile_avatar ? user.profile_avatar : dicebearUrl || "/placeholder.svg"} alt={user.first_name || "User"} className="object-cover" />
                  <AvatarFallback className="text-xs">
                    {user.first_name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Create New Post</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Share your work with the community</p>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl mx-auto max-h-[85vh] overflow-hidden p-0 flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profile_avatar ? user.profile_avatar : dicebearUrl || "/placeholder.svg"} alt={user.first_name || "User"} className="object-cover" />
                <AvatarFallback>
                  {user.first_name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-gray-500">Post to feed</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4 py-4">
                {/* Title Input */}
                <div className="space-y-2">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What's the title of your post?"
                    required
                    className="text-lg font-medium border-0 p-0 focus:ring-0 focus:border-0 placeholder:text-gray-400"
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="What do you want to talk about? Use **bold**, *italic*, or create lists..."
                    className="border-0"
                    minHeight="120px"
                  />
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-gray-900/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video Previews */}
                {videoPreviews.length > 0 && (
                  <div className="space-y-3">
                    {videoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={preview}
                          className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg"
                          controls
                          muted
                          preload="metadata"
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="absolute top-2 right-2 bg-gray-900/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category and Tags - Collapsible Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Category Select */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags Input */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tags
                      </Label>
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add tags (press Enter)"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Tags Display */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {/* Media Upload Buttons */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0"
                      asChild
                    >
                      <div className="cursor-pointer">
                        <ImageIcon className="h-5 w-5 text-gray-600" />
                      </div>
                    </Button>
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0"
                      asChild
                    >
                      <div className="cursor-pointer">
                        <Video className="h-5 w-5 text-gray-600" />
                      </div>
                    </Button>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isCreating || isUploading || !formData.title.trim()}
                  className="px-6"
                >
                  {isSubmitting || isUploading ? "Uploading..." : isCreating ? "Creating..." : "Post"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Progress Toast */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - uploadProgress / 100)}`}
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium">{uploadProgress}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Uploading post...</p>
              <p className="text-xs text-gray-500">Please wait</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
