"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import { X } from "lucide-react"

interface Skill {
  id: number
  skill: string
  is_top_skill: boolean
}

interface SkillsManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skills: Skill[]
  onSuccess: () => void
}

export function SkillsManagement({ open, onOpenChange, skills, onSuccess }: SkillsManagementProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [managedSkills, setManagedSkills] = useState<Omit<Skill, "id">[]>(skills.map(({ id, ...rest }) => rest))

  const handleAddSkill = () => {
    if (newSkill.trim() && !managedSkills.some((s) => s.skill.toLowerCase() === newSkill.toLowerCase())) {
      setManagedSkills([...managedSkills, { skill: newSkill.trim(), is_top_skill: false }])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...managedSkills]
    updatedSkills.splice(index, 1)
    setManagedSkills(updatedSkills)
  }

  const handleToggleTopSkill = (index: number) => {
    const topSkillsCount = managedSkills.filter((s) => s.is_top_skill).length
    const updatedSkills = [...managedSkills]
    const isCurrentlyTop = updatedSkills[index].is_top_skill

    // If it's already a top skill, we can always unmark it
    // If it's not a top skill, we can only mark it if we have less than 5 top skills
    if (isCurrentlyTop || (!isCurrentlyTop && topSkillsCount < 5)) {
      updatedSkills[index] = {
        ...updatedSkills[index],
        is_top_skill: !isCurrentlyTop,
      }
      setManagedSkills(updatedSkills)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await freelanceService.updateSkills({ skills: managedSkills })
      toast({
        title: "Skills updated",
        description: "Your skills have been updated successfully.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update skills. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Popular skills suggestions
  const popularSkills = [
    "JavaScript",
    "React",
    "TypeScript",
    "Node.js",
    "HTML",
    "CSS",
    "Python",
    "UI/UX Design",
    "Product Management",
    "Data Analysis",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Skills</DialogTitle>
          <DialogDescription>Add or update your professional skills.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-skill">Add a Skill</Label>
              <div className="flex gap-2">
                <Input
                  id="new-skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. JavaScript, UI Design"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Popular Skills</Label>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setNewSkill(skill)
                      setTimeout(handleAddSkill, 0)
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {managedSkills.length > 0 && (
              <div className="grid gap-2 mt-4">
                <Label>Your Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {managedSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant={skill.is_top_skill ? "default" : "outline"}
                      className="flex items-center gap-1 p-2"
                    >
                      {skill.skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="ml-1 rounded-full hover:bg-gray-200 h-4 w-4 inline-flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {managedSkills.length > 0 && (
              <div className="grid gap-2 mt-4">
                <Label>Top Skills (Select up to 5)</Label>
                <p className="text-xs text-gray-500">
                  Mark your most proficient skills to highlight them to potential clients.
                </p>
                <div className="grid gap-2 mt-2">
                  {managedSkills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`top-skill-${index}`}
                        checked={skill.is_top_skill}
                        onCheckedChange={() => handleToggleTopSkill(index)}
                        disabled={!skill.is_top_skill && managedSkills.filter((s) => s.is_top_skill).length >= 5}
                      />
                      <Label htmlFor={`top-skill-${index}`}>{skill.skill}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
