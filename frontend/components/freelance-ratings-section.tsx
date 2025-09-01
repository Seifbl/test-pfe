"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, StarHalf } from "lucide-react"
import { ratingService } from "@/services/api"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

interface Rating {
  id: number
  rating: number
  review: string
  created_at: string
  job?: {
    id: number
    title: string
  }
  company?: {
    id: number
    name: string
    logo?: string
  }
}

export function FreelanceRatingsSection() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true)
        const response = await ratingService.getMyRatings()
        setRatings(response.data || [])
        setError(null)
      } catch (err) {
        console.error("Erreur lors de la récupération des avis:", err)
        setError("Impossible de charger vos avis. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [])

  // Fonction pour afficher les étoiles selon la note
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400 h-4 w-4" />)
    }

    // Demi-étoile si nécessaire
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400 h-4 w-4" />)
    }

    // Étoiles vides
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300 h-4 w-4" />)
    }

    return stars
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr })
    } catch (e) {
      return "Date inconnue"
    }
  }

  // Calculer la note moyenne
  const averageRating =
    ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length).toFixed(1) : "0.0"

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Avis clients</CardTitle>
            <CardDescription>Les évaluations laissées par les entreprises</CardDescription>
          </div>
          {!loading && ratings.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <span className="text-lg font-bold">{averageRating}</span>
              <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          // Affichage pendant le chargement
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Affichage en cas d'erreur
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : ratings.length === 0 ? (
          // Affichage si aucun avis
          <div className="text-center py-8 text-gray-500">
            <p>Vous n'avez pas encore reçu d'avis.</p>
            <p className="text-sm mt-2">
              Les avis apparaîtront ici une fois que les entreprises auront évalué vos missions terminées.
            </p>
          </div>
        ) : (
          // Affichage des avis
          <div className="space-y-6">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={rating.company?.logo || ""} alt={rating.company?.name || "Entreprise"} />
                      <AvatarFallback>{(rating.company?.name || "E")[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{rating.company?.name || "Entreprise"}</h4>
                      <p className="text-sm text-gray-500">
                        {rating.job?.title || "Mission"} • {formatDate(rating.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex">{renderStars(rating.rating)}</div>
                </div>
                {rating.review && <div className="mt-3 text-gray-700 text-sm">"{rating.review}"</div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
