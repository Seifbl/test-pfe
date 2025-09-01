"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

interface CVUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCvUrl: string | null
  onSuccess: () => void
}

export function CVUpload({ open, onOpenChange, currentCvUrl, onSuccess }: CVUploadProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await freelanceService.uploadCV(selectedFile)
      toast({
        title: "CV uploaded",
        description: "Your CV has been uploaded successfully.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload CV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload CV</DialogTitle>
          <DialogDescription>Upload your CV to showcase your qualifications and experience.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {currentCvUrl && !selectedFile && (
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <FileIcon className="h-5 w-5 text-blue-500" />
              <span className="flex-1 truncate">Current CV uploaded</span>
              <a
                href={currentCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                View
              </a>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <FileIcon className="h-5 w-5 text-blue-500" />
              <span className="flex-1 truncate">{selectedFile.name}</span>
              <Button variant="ghost" size="sm" onClick={clearSelectedFile}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
            >
              <UploadIcon className="h-8 w-8 mx-auto text-gray-400" />
              <Label className="mt-2 block text-sm font-medium">Click to upload your CV (PDF, DOC, DOCX)</Label>
              <p className="mt-1 text-xs text-gray-500">Max file size: 5MB</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || loading}>
            {loading ? "Uploading..." : "Upload CV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
