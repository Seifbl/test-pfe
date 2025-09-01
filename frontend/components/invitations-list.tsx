"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { invitationService, jobService, ratingService } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Star, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Skill {
  id: string | number
  name: string
}

interface Rating {
  rating: number
  review?: string
  created_at: string
  job?: {
    title: string
  }
  company?: {
    name: string
  }
}

interface Freelance {
  id: string | number
  first_name: string
  last_name: string
  email: string
  title?: string
  avatar_url?: string
  skills?: Skill[]
  experience_level?: string
  score?: number
  ratings?: Rating[]
  averageRating?: number
  totalRatings?: number
}

interface Invitation {
  id: string | number
  freelance_id: string | number
  job_id: string | number
  status: string
  sent_at: string
  freelance?: Freelance
}

export default function InvitationsList({ jobId }: { jobId: string }) {
  const [freelances, setFreelances] = useState<Freelance[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loadingFreelances, setLoadingFreelances] = useState(true)
  const [loadingInvitations, setLoadingInvitations] = useState(true)
  const [invitingFreelanceId, setInvitingFreelanceId] = useState<string | number | null>(null)
  const [loadingRatings, setLoadingRatings] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const router = useRouter()

  // Récupérer les notes d'un freelance
  const fetchFreelanceRatings = async (freelanceId: string | number) => {
    try {
      setLoadingRatings((prev) => ({ ...prev, [freelanceId]: true }))
      console.log(`Récupération des ratings pour freelance ${freelanceId}`)

      const response = await ratingService.getFreelanceRatings(freelanceId)
      console.log(`Réponse API pour freelance ${freelanceId}:`, response)

      if (response && response.data && Array.isArray(response.data)) {
        const ratings = response.data
        const averageRating =
          ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length : 0

        const result = {
          ratings,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: ratings.length,
        }

        console.log(`Résultat calculé pour freelance ${freelanceId}:`, result)
        return result
      }

      console.log(`Aucune donnée valide pour freelance ${freelanceId}`)
      return { ratings: [], averageRating: 0, totalRatings: 0 }
    } catch (error) {
      console.error(`Erreur lors de la récupération des notes du freelance ${freelanceId}:`, error)
      return { ratings: [], averageRating: 0, totalRatings: 0 }
    } finally {
      setLoadingRatings((prev) => ({ ...prev, [freelanceId]: false }))
    }
  }

  // Récupérer la liste des freelances disponibles
  useEffect(() => {
    const fetchFreelances = async () => {
      try {
        setLoadingFreelances(true)
        console.log("Récupération des freelances disponibles...")

        const response = await jobService.getRecommendedFreelancers(jobId)
        console.log("Freelances recommandés:", response)

        // Récupérer les notes pour chaque freelance
        const freelancesWithRatings = await Promise.all(
          response.map(async (freelance: Freelance) => {
            const ratingsData = await fetchFreelanceRatings(freelance.id)
            return {
              ...freelance,
              ...ratingsData,
            }
          }),
        )

        setFreelances(freelancesWithRatings)
      } catch (error) {
        console.error("Erreur lors de la récupération des freelances:", error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des freelances.",
          variant: "destructive",
        })
      } finally {
        setLoadingFreelances(false)
      }
    }

    fetchFreelances()
  }, [jobId, toast])

  // Récupérer la liste des invitations déjà envoyées pour ce job
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoadingInvitations(true)
        console.log(`Récupération des invitations pour le job ${jobId}...`)

        const response = await invitationService.getInvitationsByJobId(jobId)
        console.log("Invitations récupérées:", response.data)

        setInvitations(response.data || [])
      } catch (error) {
        console.error("Erreur lors de la récupération des invitations:", error)

        // Si l'API renvoie une erreur 404, on considère qu'il n'y a pas d'invitations
        if (error.response && error.response.status === 404) {
          console.log("Aucune invitation trouvée (404)")
          setInvitations([])
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les invitations pour ce job.",
            variant: "destructive",
          })
        }
      } finally {
        setLoadingInvitations(false)
      }
    }

    fetchInvitations()
  }, [jobId, toast])

  // Envoyer une invitation à un freelance
  const inviteFreelance = async (freelanceId: string | number) => {
    try {
      setInvitingFreelanceId(freelanceId)
      console.log(`Envoi d'une invitation au freelance ${freelanceId} pour le job ${jobId}...`)

      await invitationService.createInvitation({
        freelance_id: freelanceId,
        job_id: jobId,
      })

      // Mettre à jour la liste des invitations
      const response = await invitationService.getInvitationsByJobId(jobId)
      setInvitations(response.data || [])

      toast({
        title: "Invitation envoyée",
        description: "L'invitation a été envoyée avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation.",
        variant: "destructive",
      })
    } finally {
      setInvitingFreelanceId(null)
    }
  }

  // Vérifier si un freelance a déjà été invité
  const isFreelanceInvited = (freelanceId: string | number) => {
    return invitations.some((invitation) => String(invitation.freelance_id) === String(freelanceId))
  }

  // Obtenir le statut d'invitation d'un freelance
  const getInvitationStatus = (freelanceId: string | number) => {
    const invitation = invitations.find((inv) => String(inv.freelance_id) === String(freelanceId))
    return invitation ? invitation.status : null
  }

  // Afficher le badge de statut d'invitation
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">En attente</Badge>
      case "accepted":
        return <Badge variant="success">Acceptée</Badge>
      case "declined":
        return <Badge variant="destructive">Refusée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Afficher les étoiles de notation
  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4"

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${sizeClass} text-gray-300`} />
            <Star
              className={`${sizeClass} fill-yellow-400 text-yellow-400 absolute top-0 left-0`}
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>,
        )
      } else {
        stars.push(<Star key={i} className={`${sizeClass} text-gray-300`} />)
      }
    }

    return <div className="flex items-center gap-0.5">{stars}</div>
  }

  // Composant pour afficher les avis dans une modale
  const RatingsModal = ({ freelance }: { freelance: Freelance }) => {
    console.log("RatingsModal - freelance data:", freelance)
    console.log("RatingsModal - ratings:", freelance.ratings)

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <MessageSquare className="h-3 w-3" />
            Voir avis ({freelance.totalRatings || 0})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={freelance.avatar_url || ""} alt={`${freelance.first_name} ${freelance.last_name}`} />
                <AvatarFallback>
                  {freelance.first_name?.[0] || "F"}
                  {freelance.last_name?.[0] || "L"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  Avis pour {freelance.first_name} {freelance.last_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {renderStars(freelance.averageRating || 0, "md")}
                  <span>{freelance.averageRating?.toFixed(1) || "0.0"}/5</span>
                  <span>({freelance.totalRatings || 0} avis)</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {freelance.ratings && freelance.ratings.length > 0 ? (
                freelance.ratings.map((rating, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {renderStars(rating.rating, "md")}
                        <span className="font-medium">{rating.rating}/5</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {rating.job?.title && (
                      <div className="text-sm text-muted-foreground mb-1">Mission: {rating.job.title}</div>
                    )}
                    {rating.company?.name && (
                      <div className="text-sm text-muted-foreground mb-2">Par: {rating.company.name}</div>
                    )}
                    {rating.review && <p className="text-sm">{rating.review}</p>}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun avis détaillé disponible pour ce freelance.</p>
                  <p className="text-xs mt-2">Les données d'avis peuvent ne pas être chargées correctement.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  // Filtrer les freelances déjà invités
  const invitedFreelances = freelances.filter((freelance) => isFreelanceInvited(freelance.id))

  // Filtrer les freelances non invités
  const availableFreelances = freelances.filter((freelance) => !isFreelanceInvited(freelance.id))

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Invitations</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="available">Freelances disponibles ({availableFreelances.length})</TabsTrigger>
          <TabsTrigger value="invited">Freelances invités ({invitedFreelances.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {loadingFreelances || loadingInvitations ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des freelances...</span>
            </div>
          ) : availableFreelances.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Aucun freelance disponible.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableFreelances.map((freelance) => (
                <Card key={freelance.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={freelance.avatar_url || ""}
                            alt={`${freelance.first_name} ${freelance.last_name}`}
                          />
                          <AvatarFallback>
                            {freelance.first_name?.[0] || "F"}
                            {freelance.last_name?.[0] || "L"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {freelance.first_name} {freelance.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{freelance.title || "Freelance"}</p>

                          {/* Affichage des notes */}
                          {freelance.totalRatings && freelance.totalRatings > 0 ? (
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(freelance.averageRating || 0)}
                              <span className="text-sm text-muted-foreground">
                                {freelance.averageRating?.toFixed(1)} ({freelance.totalRatings} avis)
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground mt-1">Aucun avis disponible</div>
                          )}

                          {freelance.score !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Compatibilité : {(freelance.score * 100).toFixed(0)}%
                            </p>
                          )}
                          {freelance.experience_level && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Expérience: {freelance.experience_level}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {freelance.skills?.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill.name}
                              </Badge>
                            ))}
                            {freelance.skills && freelance.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{freelance.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Link href={`/company/freelances/${freelance.id}`} passHref>
                          <Button variant="outline" className="w-full sm:w-auto">
                            Voir profil
                          </Button>
                        </Link>
                        {(freelance.totalRatings && freelance.totalRatings > 0) ||
                        (freelance.averageRating && freelance.averageRating > 0) ? (
                          <RatingsModal freelance={freelance} />
                        ) : null}
                        <Button
                          onClick={() => inviteFreelance(freelance.id)}
                          disabled={invitingFreelanceId === freelance.id}
                          className="w-full sm:w-auto"
                        >
                          {invitingFreelanceId === freelance.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            "Inviter"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invited">
          {loadingFreelances || loadingInvitations ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des invitations...</span>
            </div>
          ) : invitedFreelances.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Aucune invitation envoyée pour ce job.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {invitedFreelances.map((freelance) => {
                const status = getInvitationStatus(freelance.id)
                return (
                  <Card key={freelance.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={freelance.avatar_url || ""}
                              alt={`${freelance.first_name} ${freelance.last_name}`}
                            />
                            <AvatarFallback>
                              {freelance.first_name?.[0] || "F"}
                              {freelance.last_name?.[0] || "L"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {freelance.first_name} {freelance.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{freelance.title || "Freelance"}</p>

                            {/* Affichage des notes */}
                            {freelance.totalRatings && freelance.totalRatings > 0 ? (
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(freelance.averageRating || 0)}
                                <span className="text-sm text-muted-foreground">
                                  {freelance.averageRating?.toFixed(1)} ({freelance.totalRatings} avis)
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground mt-1">Aucun avis disponible</div>
                            )}

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">Statut:</span>
                              {status && getStatusBadge(status)}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {freelance.skills?.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill.name}
                                </Badge>
                              ))}
                              {freelance.skills && freelance.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{freelance.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                          <Link href={`/company/freelances/${freelance.id}`} passHref>
                            <Button variant="outline" className="w-full sm:w-auto">
                              Voir profil
                            </Button>
                          </Link>
                          {(freelance.totalRatings && freelance.totalRatings > 0) ||
                          (freelance.averageRating && freelance.averageRating > 0) ? (
                            <RatingsModal freelance={freelance} />
                          ) : null}
                          <Link href={`/messages/${jobId}/${freelance.id}`} passHref>
                            <Button variant="outline" className="w-full sm:w-auto">
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
