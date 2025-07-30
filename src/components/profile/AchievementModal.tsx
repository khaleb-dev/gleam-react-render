"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { profileApiService } from "@/services/profileApi"
import { toast } from "sonner"

interface AchievementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newUserData: any) => void
}

export const AchievementModal = ({ open, onOpenChange, onSuccess }: AchievementModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date_awarded: "",
    link: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        date_awarded: new Date(formData.date_awarded).toISOString(),
        link: formData.link || undefined,
      }

      const response = await profileApiService.addAchievement(payload)

      if (response.success) {
        toast.success(response.message)
        onSuccess(response.data)
        onOpenChange(false)
        // Reset form
        setFormData({
          title: "",
          description: "",
          date_awarded: "",
          link: "",
        })
      }
    } catch (error) {
      console.error("Error adding achievement:", error)
      toast.error("Failed to add achievement")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Achievement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Achievement Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe your achievement..."
              required
            />
          </div>

          <div>
            <Label htmlFor="date_awarded">Date Awarded</Label>
            <Input
              id="date_awarded"
              type="date"
              value={formData.date_awarded}
              onChange={(e) => setFormData((prev) => ({ ...prev, date_awarded: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="link">Link (Optional)</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
              placeholder="https://example.com/certificate"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Achievement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
