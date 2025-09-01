"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface SkillsFormProps {
  onComplete: () => void
  onBack: () => void
}

export default function SkillsForm({ onComplete, onBack }: SkillsFormProps) {
  const [skills, setSkills] = useState<{ name: string; isTopSkill: boolean }[]>([])
  const [newSkill, setNewSkill] = useState("")

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.some((skill) => skill.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, { name: newSkill.trim(), isTopSkill: false }])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...skills]
    newSkills.splice(index, 1)
    setSkills(newSkills)
  }

  const handleToggleTopSkill = (index: number) => {
    const newSkills = [...skills]
    newSkills[index].isTopSkill = !newSkills[index].isTopSkill
    setSkills(newSkills)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save data to API or context
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What skills do you have?</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="skill">Add a Skill</Label>
            <div className="flex gap-2">
              <Input
                id="skill"
                placeholder="e.g. JavaScript, UI Design, Project Management"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
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

          {skills.length > 0 && (
            <div className="space-y-4">
              <Label>Your Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant={skill.isTopSkill ? "default" : "outline"}
                    className="flex items-center gap-1 p-2"
                  >
                    {skill.name}
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

          {skills.length > 0 && (
            <div className="space-y-4">
              <Label>Top Skills (Select up to 5)</Label>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`top-skill-${index}`}
                      checked={skill.isTopSkill}
                      onCheckedChange={() => handleToggleTopSkill(index)}
                      disabled={!skill.isTopSkill && skills.filter((s) => s.isTopSkill).length >= 5}
                    />
                    <Label htmlFor={`top-skill-${index}`}>{skill.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
