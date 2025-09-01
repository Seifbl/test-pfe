"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface WorkHistoryFormProps {
  onComplete: () => void
  onBack: () => void
}

export default function WorkHistoryForm({ onComplete, onBack }: WorkHistoryFormProps) {
  const [experiences, setExperiences] = useState([
    {
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    },
  ])

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
      },
    ])
  }

  const handleRemoveExperience = (index: number) => {
    const newExperiences = [...experiences]
    newExperiences.splice(index, 1)
    setExperiences(newExperiences)
  }

  const handleExperienceChange = (index: number, field: string, value: string | boolean) => {
    const newExperiences = [...experiences]
    newExperiences[index] = { ...newExperiences[index], [field]: value }
    setExperiences(newExperiences)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save data to API or context
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work History</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {experiences.map((experience, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor={`title-${index}`}>Job Title</Label>
                <Input
                  id={`title-${index}`}
                  placeholder="e.g. UX Designer"
                  value={experience.title}
                  onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`company-${index}`}>Company</Label>
                <Input
                  id={`company-${index}`}
                  placeholder="e.g. Acme Inc."
                  value={experience.company}
                  onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                  <Input
                    id={`start-date-${index}`}
                    type="month"
                    value={experience.startDate}
                    onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`end-date-${index}`}>End Date</Label>
                  <Input
                    id={`end-date-${index}`}
                    type="month"
                    value={experience.endDate}
                    onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                    disabled={experience.currentlyWorking}
                    required={!experience.currentlyWorking}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-${index}`}
                  checked={experience.currentlyWorking}
                  onCheckedChange={(checked) => {
                    handleExperienceChange(index, "currentlyWorking", !!checked)
                    if (checked) {
                      handleExperienceChange(index, "endDate", "")
                    }
                  }}
                />
                <Label htmlFor={`current-${index}`}>I currently work here</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  placeholder="Describe your responsibilities and achievements..."
                  value={experience.description}
                  onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {experiences.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-500"
                >
                  Remove Experience
                </Button>
              )}
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleAddExperience}>
            Add Another Experience
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Complete Profile</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
