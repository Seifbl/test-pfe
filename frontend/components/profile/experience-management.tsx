"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { freelanceService } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"

interface Experience {
  id?: number
  title: string
  company: string
  start_date: string
  end_date: string | null
  currently_working: boolean
  description: string
}

interface ExperienceManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experiences: Experience[]
  onSuccess: () => void
}

export function ExperienceManagement({ open, onOpenChange, experiences, onSuccess }: ExperienceManagementProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newExperiences, setNewExperiences] = useState<Experience[]>(
    experiences.length > 0
      ? experiences
      : [
          {
            title: "",
            company: "",
            start_date: "",
            end_date: "",
            currently_working: false,
            description: "",
          },
        ],
  )

  const handleAddExperience = () => {
    setNewExperiences([
      ...newExperiences,
      {
        title: "",
        company: "",
        start_date: "",
        end_date: "",
        currently_working: false,
        description: "",
      },
    ])
  }

  const handleRemoveExperience = (index: number) => {
    const updatedExperiences = [...newExperiences]
    updatedExperiences.splice(index, 1)
    setNewExperiences(updatedExperiences)
  }

  const handleExperienceChange = (index: number, field: keyof Experience, value: string | boolean | null) => {
    const updatedExperiences = [...newExperiences]
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value }
    setNewExperiences(updatedExperiences)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For simplicity, we'll just add the first experience
      // In a real app, you'd want to handle multiple experiences
      if (newExperiences.length > 0) {
        await freelanceService.updateExperiences({ experiences: newExperiences })
      }

      toast({
        title: "Experience updated",
        description: "Your work experience has been updated successfully.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update experience. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Work Experience</DialogTitle>
          <DialogDescription>Add or update your professional experience.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {newExperiences.map((experience, index) => (
              <div key={index} className="grid gap-3 p-3 border rounded-md">
                <div className="grid gap-2">
                  <Label htmlFor={`title-${index}`}>Job Title</Label>
                  <Input
                    id={`title-${index}`}
                    value={experience.title}
                    onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`company-${index}`}>Company</Label>
                  <Input
                    id={`company-${index}`}
                    value={experience.company}
                    onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                    placeholder="e.g. Acme Inc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                    <Input
                      id={`start-date-${index}`}
                      type="month"
                      value={experience.start_date}
                      onChange={(e) => handleExperienceChange(index, "start_date", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`end-date-${index}`}>End Date</Label>
                    <Input
                      id={`end-date-${index}`}
                      type="month"
                      value={experience.end_date || ""}
                      onChange={(e) => handleExperienceChange(index, "end_date", e.target.value)}
                      disabled={experience.currently_working}
                      required={!experience.currently_working}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox
                    id={`current-${index}`}
                    checked={experience.currently_working}
                    onCheckedChange={(checked) => {
                      handleExperienceChange(index, "currently_working", !!checked)
                      if (checked) {
                        handleExperienceChange(index, "end_date", null)
                      }
                    }}
                  />
                  <Label htmlFor={`current-${index}`} className="text-sm">
                    I currently work here
                  </Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={experience.description}
                    onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    className="min-h-[100px]"
                  />
                </div>

                {newExperiences.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-500"
                    onClick={() => handleRemoveExperience(index)}
                  >
                    Remove Experience
                  </Button>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" className="mt-2" onClick={handleAddExperience}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Experience
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
