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

interface EducationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newUserData: any) => void
}

export const EducationModal = ({ open, onOpenChange, onSuccess }: EducationModalProps) => {
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_year: "",
    end_year: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        start_year: Number.parseInt(formData.start_year),
        end_year: Number.parseInt(formData.end_year),
      }

      const response = await profileApiService.addEducation(payload)

      if (response.success) {
        toast.success(response.message)
        onSuccess(response.data)
        onOpenChange(false)
        // Reset form
        setFormData({
          institution: "",
          degree: "",
          field_of_study: "",
          start_year: "",
          end_year: "",
          description: "",
        })
      }
    } catch (error) {
      console.error("Error adding education:", error)
      toast.error("Failed to add education")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Education</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => setFormData((prev) => ({ ...prev, institution: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              value={formData.degree}
              onChange={(e) => setFormData((prev) => ({ ...prev, degree: e.target.value }))}
              placeholder="e.g., Bachelor's, Master's, PhD"
              required
            />
          </div>

          <div>
            <Label htmlFor="field_of_study">Field of Study</Label>
            <Input
              id="field_of_study"
              value={formData.field_of_study}
              onChange={(e) => setFormData((prev) => ({ ...prev, field_of_study: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_year">Start Year</Label>
              <Input
                id="start_year"
                type="number"
                value={formData.start_year}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_year: e.target.value }))}
                min="1900"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_year">End Year</Label>
              <Input
                id="end_year"
                type="number"
                value={formData.end_year}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_year: e.target.value }))}
                min="1900"
                max={new Date().getFullYear() + 10}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe your studies, achievements, or relevant coursework..."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Education"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
