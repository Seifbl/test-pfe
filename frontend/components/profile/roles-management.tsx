"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Role {
  id: number
  role: string
  years_of_experience: number
  is_primary: boolean
}

interface RolesManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: Role[]
  onSuccess: () => void
}

export function RolesManagement({ open, onOpenChange, roles, onSuccess }: RolesManagementProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newRoles, setNewRoles] = useState<Omit<Role, "id">[]>(
    roles.length > 0 ? roles.map(({ id, ...rest }) => rest) : [{ role: "", years_of_experience: 1, is_primary: false }],
  )

  const handleAddRole = () => {
    setNewRoles([...newRoles, { role: "", years_of_experience: 1, is_primary: false }])
  }

  const handleRemoveRole = (index: number) => {
    const updatedRoles = [...newRoles]
    updatedRoles.splice(index, 1)
    setNewRoles(updatedRoles)
  }

  const handleRoleChange = (index: number, field: keyof Omit<Role, "id">, value: string | number | boolean) => {
    const updatedRoles = [...newRoles]
    updatedRoles[index] = { ...updatedRoles[index], [field]: value }
    setNewRoles(updatedRoles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Ensure only one role is primary
      const hasPrimary = newRoles.some((role) => role.is_primary)
      const finalRoles = hasPrimary
        ? newRoles
        : newRoles.map((role, index) => (index === 0 ? { ...role, is_primary: true } : role))

      await freelanceService.updateRoles({ roles: finalRoles })
      toast({
        title: "Roles updated",
        description: "Your professional roles have been updated successfully.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update roles. Please try again.",
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
          <DialogTitle>Manage Professional Roles</DialogTitle>
          <DialogDescription>Add or update your professional roles and experience.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {newRoles.map((role, index) => (
              <div key={index} className="grid gap-3 p-3 border rounded-md">
                <div className="grid gap-2">
                  <Label htmlFor={`role-${index}`}>Role Title</Label>
                  <Input
                    id={`role-${index}`}
                    value={role.role}
                    onChange={(e) => handleRoleChange(index, "role", e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`years-${index}`}>Years of Experience</Label>
                  <Select
                    value={role.years_of_experience.toString()}
                    onValueChange={(value) => handleRoleChange(index, "years_of_experience", Number.parseInt(value))}
                  >
                    <SelectTrigger id={`years-${index}`}>
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year} {year === 1 ? "year" : "years"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox
                    id={`primary-${index}`}
                    checked={role.is_primary}
                    onCheckedChange={(checked) => {
                      // If this role is being set as primary, unset others
                      if (checked) {
                        setNewRoles(
                          newRoles.map((r, i) => ({
                            ...r,
                            is_primary: i === index,
                          })),
                        )
                      } else {
                        handleRoleChange(index, "is_primary", false)
                      }
                    }}
                  />
                  <Label htmlFor={`primary-${index}`} className="text-sm">
                    This is my primary role
                  </Label>
                </div>

                {newRoles.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-500"
                    onClick={() => handleRemoveRole(index)}
                  >
                    Remove Role
                  </Button>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" className="mt-2" onClick={handleAddRole}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Role
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
