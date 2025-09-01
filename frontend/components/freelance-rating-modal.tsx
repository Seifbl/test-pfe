"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ratingService } from "@/services/api"

interface FreelanceRatingModalProps {
  isOpen: boolean
  onClose: () => void
  freelance: {
    id: number
    first_name: string
    last_name: string
    title?: string
    avatar?: string
  }
  jobId: number
  jobTitle: string
}

export default function FreelanceRatingModal({
  isOpen,
  onClose,
  freelance,
  jobId,
  jobTitle,
}: FreelanceRatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note avant de continuer.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await ratingService.rateFreelance({
        freelance_id: freelance.id,
        job_id: jobId,
        rating,
        review: review.trim() || undefined,
      })

      toast({
        title: "Notation envoyée",
        description: `Vous avez noté ${freelance.first_name} ${freelance.last_name} avec ${rating} étoile${rating > 1 ? "s" : ""}.`,
      })

      // Réinitialiser le formulaire
      setRating(0)
      setReview("")
      onClose()
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notation:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notation. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setReview("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Noter le freelance</DialogTitle>
          <DialogDescription>
            Évaluez le travail de {freelance.first_name} {freelance.last_name} sur la mission "{jobTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {/* Profil du freelance */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={freelance.avatar || "/placeholder.svg"}
                alt={`${freelance.first_name} ${freelance.last_name}`}
              />
              <AvatarFallback className="text-lg">
                {freelance.first_name[0]}
                {freelance.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {freelance.first_name} {freelance.last_name}
              </h3>
              {freelance.title && <p className="text-sm text-muted-foreground">{freelance.title}</p>}
            </div>
          </div>

          {/* Système de notation */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm font-medium">Votre note :</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating} étoile{rating > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Zone de commentaire */}
          <div className="w-full space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Commentaire (optionnel) :
            </label>
            <Textarea
              id="review"
              placeholder="Partagez votre expérience avec ce freelance..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Envoi..." : "Envoyer la note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
