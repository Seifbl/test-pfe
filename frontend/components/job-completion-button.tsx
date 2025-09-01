"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import { jobService } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface JobCompletionButtonProps {
  jobId: string
  isCompleted?: boolean
  assignedFreelanceId?: string | null
  onJobCompleted?: (jobId: string) => void
}

export default function JobCompletionButton({
  jobId,
  isCompleted = false,
  assignedFreelanceId,
  onJobCompleted,
}: JobCompletionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)
  const { toast } = useToast()

  // Vérifier si le bouton doit être affiché
  const shouldShowButton = assignedFreelanceId && !completed

  const handleCompleteJob = async () => {
    try {
      setLoading(true)

      await jobService.completeJob(jobId)

      setCompleted(true)

      toast({
        title: "Mission terminée",
        description: "Le job a été marqué comme terminé avec succès.",
        variant: "default",
      })

      // Callback pour notifier le parent
      onJobCompleted?.(jobId)
    } catch (error) {
      console.error("Erreur lors du marquage comme terminé:", error)

      toast({
        title: "Erreur",
        description: "Impossible de marquer le job comme terminé. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Si le job est terminé, afficher le badge de statut
  if (completed) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />✅ Mission terminée
      </Badge>
    )
  }

  // Si aucun freelance n'est affecté, ne rien afficher
  if (!shouldShowButton) {
    return null
  }

  // Afficher le bouton de completion
  return (
    <Button
      onClick={handleCompleteJob}
      disabled={loading}
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Marquage...
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Marquer comme terminé
        </>
      )}
    </Button>
  )
}
