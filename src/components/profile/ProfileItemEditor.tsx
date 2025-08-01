"use client"

import type React from "react"
import { useState } from "react"
import { Edit, Save, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface ProfileItemEditorProps {
  item: any
  type: "experience" | "education" | "achievement"
  onSave: (item: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isOwnProfile: boolean
  isEditMode?: boolean
}

export const ProfileItemEditor: React.FC<ProfileItemEditorProps> = ({
  item,
  type,
  onSave,
  onDelete,
  isOwnProfile,
  isEditMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState(item)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(editedItem)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedItem(item)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await onDelete(item._id)
    }
  }

  const showEditControls = isOwnProfile && (isEditMode || isEditing)

  if (isEditing) {
    return (
      <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
        {type === "experience" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={editedItem.title}
                onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
                placeholder="Job Title"
              />
              <Input
                value={editedItem.company}
                onChange={(e) => setEditedItem({ ...editedItem, company: e.target.value })}
                placeholder="Company"
              />
            </div>
            <Input
              value={editedItem.location}
              onChange={(e) => setEditedItem({ ...editedItem, location: e.target.value })}
              placeholder="Location"
            />
            <Textarea
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              placeholder="Description"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={editedItem.start_date?.split("T")[0]}
                onChange={(e) => setEditedItem({ ...editedItem, start_date: e.target.value })}
                placeholder="Start Date"
              />
              {!editedItem.is_current && (
                <Input
                  type="date"
                  value={editedItem.end_date?.split("T")[0]}
                  onChange={(e) => setEditedItem({ ...editedItem, end_date: e.target.value })}
                  placeholder="End Date"
                />
              )}
            </div>
          </>
        )}

        {type === "education" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={editedItem.institution}
                onChange={(e) => setEditedItem({ ...editedItem, institution: e.target.value })}
                placeholder="Institution"
              />
              <Input
                value={editedItem.degree}
                onChange={(e) => setEditedItem({ ...editedItem, degree: e.target.value })}
                placeholder="Degree"
              />
            </div>
            <Input
              value={editedItem.field_of_study}
              onChange={(e) => setEditedItem({ ...editedItem, field_of_study: e.target.value })}
              placeholder="Field of Study"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                value={editedItem.start_year}
                onChange={(e) => setEditedItem({ ...editedItem, start_year: Number.parseInt(e.target.value) })}
                placeholder="Start Year"
              />
              <Input
                type="number"
                value={editedItem.end_year}
                onChange={(e) => setEditedItem({ ...editedItem, end_year: Number.parseInt(e.target.value) })}
                placeholder="End Year"
              />
            </div>
            <Textarea
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              placeholder="Description"
              rows={3}
            />
          </>
        )}

        {type === "achievement" && (
          <>
            <Input
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              placeholder="Achievement Title"
            />
            <Textarea
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              placeholder="Description"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={editedItem.date_awarded?.split("T")[0]}
                onChange={(e) => setEditedItem({ ...editedItem, date_awarded: e.target.value })}
                placeholder="Date Awarded"
              />
              <Input
                value={editedItem.link || ""}
                onChange={(e) => setEditedItem({ ...editedItem, link: e.target.value })}
                placeholder="Link (optional)"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isLoading} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" onClick={handleCancel} size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {showEditControls && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="p-1">
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="p-1 text-red-500 hover:text-red-700">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Original display content */}
      <div className="space-y-3">
        {type === "experience" && (
          <>
            <h4 className="font-semibold text-foreground text-sm sm:text-base">{item.title}</h4>
            <p className="text-primary font-medium text-sm">{item.company}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              {new Date(item.start_date).getFullYear()} -{" "}
              {item.is_current ? "Present" : new Date(item.end_date).getFullYear()}
              {item.location && ` • ${item.location}`}
            </p>
            <p className="text-foreground text-xs sm:text-sm mb-3">{item.description}</p>
            {item.tools && item.tools.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tools.map((tool: string, toolIndex: number) => (
                  <Badge key={toolIndex} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}

        {type === "education" && (
          <>
            <h4 className="font-semibold text-foreground text-sm sm:text-base">{item.degree}</h4>
            <p className="text-primary font-medium text-sm">{item.institution}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              {item.field_of_study} • {item.start_year} - {item.end_year}
            </p>
            <p className="text-foreground text-xs sm:text-sm">{item.description}</p>
          </>
        )}

        {type === "achievement" && (
          <>
            <h4 className="font-semibold text-foreground text-sm sm:text-base">{item.title}</h4>
            <p className="text-foreground text-xs sm:text-sm mb-2">{item.description}</p>
            <p className="text-xs text-muted-foreground">{new Date(item.date_awarded).toLocaleDateString()}</p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View Certificate
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}
