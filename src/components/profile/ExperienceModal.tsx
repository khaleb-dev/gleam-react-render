"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { profileApiService } from "@/services/profileApi"
import { toast } from "sonner"

interface ExperienceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newUserData: any) => void
}

export const ExperienceModal = ({ open, onOpenChange, onSuccess }: ExperienceModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    is_current: false,
    tools: [] as string[],
  })
  const [newTool, setNewTool] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.is_current ? null : new Date(formData.end_date).toISOString(),
      }

      const response = await profileApiService.addExperience(payload)

      if (response.success) {
        toast.success(response.message)
        onSuccess(response.data)
        onOpenChange(false)
        // Reset form
        setFormData({
          title: "",
          company: "",
          description: "",
          start_date: "",
          end_date: "",
          location: "",
          is_current: false,
          tools: [],
        })
      }
    } catch (error) {
      console.error("Error adding experience:", error)
      toast.error("Failed to add experience")
    } finally {
      setIsLoading(false)
    }
  }

  const addTool = () => {
    if (newTool.trim() && !formData.tools.includes(newTool.trim())) {
      setFormData((prev) => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()],
      }))
      setNewTool("")
    }
  }

  const removeTool = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t !== tool),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Experience</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                disabled={formData.is_current}
                required={!formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_current: !!checked }))}
            />
            <Label htmlFor="is_current">I currently work here</Label>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Skills & Tools</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTool()
                  }
                }}
              />
              <Button type="button" onClick={addTool} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tools.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tools.map((tool, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tool}
                    <button type="button" onClick={() => removeTool(tool)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Experience"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
