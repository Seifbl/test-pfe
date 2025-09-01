"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface RolesFormProps {
  onComplete: () => void
  onBack: () => void
}

export default function RolesForm({ onComplete, onBack }: RolesFormProps) {
  const [roles, setRoles] = useState([{ role: "", yearsOfExperience: "", isPrimary: false }])

  const handleAddRole = () => {
    setRoles([...roles, { role: "", yearsOfExperience: "", isPrimary: false }])
  }

  const handleRemoveRole = (index: number) => {
    const newRoles = [...roles]
    newRoles.splice(index, 1)
    setRoles(newRoles)
  }

  const handleRoleChange = (index: number, field: string, value: string | boolean) => {
    const newRoles = [...roles]
    newRoles[index] = { ...newRoles[index], [field]: value }
    setRoles(newRoles)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save data to API or context
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What roles do you work in?</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {roles.map((role, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor={`role-${index}`}>Role</Label>
                <Input
                  id={`role-${index}`}
                  placeholder="e.g. UX Designer"
                  value={role.role}
                  onChange={(e) => handleRoleChange(index, "role", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`years-${index}`}>Years of Experience</Label>
                <Select onValueChange={(value) => handleRoleChange(index, "yearsOfExperience", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "10+"].map((year) => (
                      <SelectItem key={year.toString()} value={year.toString()}>
                        {year} {year === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`primary-${index}`}
                  checked={role.isPrimary}
                  onCheckedChange={(checked) => handleRoleChange(index, "isPrimary", !!checked)}
                />
                <Label htmlFor={`primary-${index}`}>This is my primary role</Label>
              </div>

              {roles.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveRole(index)}
                  className="text-red-500"
                >
                  Remove Role
                </Button>
              )}
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleAddRole}>
            Add Another Role
          </Button>
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
