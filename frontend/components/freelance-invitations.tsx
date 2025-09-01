"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { invitationService } from "@/services/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, Clock, XCircle, ExternalLink, MessageSquare, AlertCircle } from "lucide-react"
import Link from "next/link"
import { routes } from "@/constants/routes"

// Interface pour les invitations basée sur la structure de l'API
interface Invitation {
  invitation_id: string | number
  job_id: string | number
  job_title?: string
  status: string
  sent_at: string
  // Champs supplémentaires pour la compatibilité avec le code existant
  id?: string | number
  freelance_id?: string | number
  job?: {
    id?: string | number
    title?: string
    description?: string
    company?: {
      id: string | number
      name: string
      logo_url?: string
    }
    entreprise?: {
      id: string | number
      first_name: string
      surname: string
      organization_size?: string
    }
  }
}

export function FreelanceInvitations() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingDemoData, setUsingDemoData] = useState(false)

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user?.id) {
        setLoading(false)
        setError("Utilisateur non connecté")
        return
      }

      try {
        setLoading(true)
        setError(null)
        setUsingDemoData(false)

        console.log("Tentative de récupération des invitations pour l'utilisateur:", user.id)

        // Utiliser directement getMyInvitations qui contient toute la logique de secours
        const response = await invitationService.getMyInvitations()
        console.log("Réponse des invitations:", response)

        // Vérifier si nous utilisons des données de démonstration
        if (response.isDemo) {
          setUsingDemoData(true)
          toast({
            title: "Mode démonstration",
            description: "Affichage de données d'exemple car l'API n'est pas disponible.",
            variant: "warning",
          })
        }

        if (response && response.data) {
          // Normaliser les données pour qu'elles soient compatibles avec notre interface
          const normalizedInvitations = Array.isArray(response.data)
            ? response.data.map((invitation: any) => {
                // Vérifier si l'invitation utilise le nouveau format d'API ou l'ancien
                const isNewFormat = invitation.invitation_id !== undefined && invitation.job_title !== undefined

                return {
                  // Utiliser les champs appropriés selon le format
                  id: isNewFormat ? invitation.invitation_id : invitation.id,
                  invitation_id: isNewFormat ? invitation.invitation_id : invitation.id,
                  job_id: isNewFormat ? invitation.job_id : invitation.job_id,
                  job_title: isNewFormat ? invitation.job_title : undefined,
                  freelance_id: isNewFormat ? undefined : invitation.freelance_id,
                  status: invitation.status,
                  sent_at: invitation.sent_at,
                  // Créer un objet job à partir des données disponibles
                  job: isNewFormat
                    ? {
                        id: invitation.job_id,
                        title: invitation.job_title,
                        description: invitation.job_description || "",
                        entreprise: invitation.company_name
                          ? {
                              id: invitation.company_id || 0,
                              first_name: invitation.company_name.split(" ")[0] || "",
                              surname: invitation.company_name.split(" ").slice(1).join(" ") || "",
                            }
                          : undefined,
                      }
                    : invitation.job || {
                        id: invitation.job_id,
                        title: invitation.job_title || "Offre d'emploi",
                      },
                }
              })
            : []

          setInvitations(normalizedInvitations)
        } else {
          setInvitations([])
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des invitations:", err)
        // Utiliser des données de démonstration en cas d'erreur
        loadDemoData()
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [user?.id])

  // Mettre à jour la fonction handleUpdateStatus pour utiliser les nouveaux termes "accepted" et "refused"

  const handleUpdateStatus = async (invitationId: string | number, status: string) => {
    try {
      // Si nous utilisons des données de démonstration, simuler la mise à jour localement
      if (usingDemoData) {
        // Mettre à jour l'état local uniquement
        setInvitations((prevInvitations) =>
          prevInvitations.map((invitation) =>
            invitation.id === invitationId || invitation.invitation_id === invitationId
              ? { ...invitation, status }
              : invitation,
          ),
        )

        // Afficher un message de succès
        toast({
          title: status === "accepted" ? "Invitation acceptée (démo)" : "Invitation refusée (démo)",
          description: "Cette action est simulée en mode démonstration.",
          variant: status === "accepted" ? "default" : "destructive",
        })
        return
      }

      // Sinon, faire l'appel API réel
      await invitationService.updateInvitationStatus(invitationId, status)

      // Mettre à jour l'état local
      setInvitations((prevInvitations) =>
        prevInvitations.map((invitation) =>
          invitation.id === invitationId || invitation.invitation_id === invitationId
            ? { ...invitation, status }
            : invitation,
        ),
      )

      // Afficher un message de succès
      toast({
        title: status === "accepted" ? "Invitation acceptée" : "Invitation refusée",
        description:
          status === "accepted"
            ? "Vous avez accepté l'invitation. L'entreprise sera notifiée."
            : "Vous avez refusé l'invitation. L'entreprise sera notifiée.",
        variant: status === "accepted" ? "default" : "destructive",
      })
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du statut de l'invitation ${invitationId}:`, err)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'invitation. Veuillez réessayer plus tard.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> En attente
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" /> Acceptée
          </Badge>
        )
      case "declined":
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Refusée
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Vos invitations à postuler à des offres</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-4 w-[250px] mb-2" />
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Vos invitations à postuler à des offres</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="flex flex-col gap-2 items-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
              <Button variant="ghost" onClick={loadDemoData}>
                Charger des exemples d'invitations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Invitations
          {usingDemoData && (
            <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800">
              <AlertCircle className="h-3 w-3" /> Mode démo
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Vos invitations à postuler à des offres</CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Vous n'avez pas encore reçu d'invitations.</p>
            {!usingDemoData && (
              <Button variant="ghost" onClick={loadDemoData} className="mt-4">
                Voir des exemples d'invitations
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id || invitation.invitation_id}
                className="flex flex-col space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {invitation.job?.title || invitation.job_title || "Offre sans titre"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {invitation.job?.company?.name ||
                        (invitation.job?.entreprise
                          ? `${invitation.job.entreprise.first_name} ${invitation.job.entreprise.surname}`
                          : "Entreprise inconnue")}
                    </p>
                  </div>
                  {getStatusBadge(invitation.status)}
                </div>
                <p className="text-sm">
                  {invitation.job?.description
                    ? invitation.job.description.length > 150
                      ? `${invitation.job.description.substring(0, 150)}...`
                      : invitation.job.description
                    : "Aucune description disponible"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Invitation reçue le {new Date(invitation.sent_at).toLocaleDateString()}
                </p>
                <div className="flex justify-end gap-2">
                  {invitation.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(invitation.id || invitation.invitation_id, "refused")}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(invitation.id || invitation.invitation_id, "accepted")}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Accepter
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={routes.talent.jobDetail(invitation.job_id.toString())}>
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Voir l'offre
                    </Link>
                  </Button>
                  {invitation.status === "accepted" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={routes.talent.messages}>
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Contacter
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={routes.talent.jobs}>Voir toutes les offres</Link>
        </Button>
        {usingDemoData && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer avec l'API
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  // Fonction pour charger des données de démonstration si nécessaire
  function loadDemoData() {
    const currentDate = new Date()
    const yesterday = new Date(currentDate)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastWeek = new Date(currentDate)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const demoInvitations = [
      {
        invitation_id: "demo1",
        id: "demo1",
        job_id: "1",
        job_title: "Développeur Frontend React",
        freelance_id: user?.id || "1",
        status: "pending",
        sent_at: currentDate.toISOString(),
        job: {
          id: "1",
          title: "Développeur Frontend React",
          description:
            "Nous recherchons un développeur React expérimenté pour travailler sur notre application web. Vous serez responsable de la création d'interfaces utilisateur réactives et de la maintenance du code existant.",
          entreprise: {
            id: "1",
            first_name: "Entreprise",
            surname: "Demo",
          },
        },
      },
      {
        invitation_id: "demo2",
        id: "demo2",
        job_id: "2",
        job_title: "Développeur Backend Node.js",
        freelance_id: user?.id || "1",
        status: "accepted",
        sent_at: yesterday.toISOString(),
        job: {
          id: "2",
          title: "Développeur Backend Node.js",
          description:
            "Rejoignez notre équipe pour développer des API performantes avec Node.js et Express. Vous travaillerez sur notre architecture microservices et contribuerez à l'amélioration de nos systèmes.",
          entreprise: {
            id: "2",
            first_name: "Société",
            surname: "Test",
          },
        },
      },
      {
        invitation_id: "demo3",
        id: "demo3",
        job_id: "3",
        job_title: "Designer UX/UI",
        freelance_id: user?.id || "1",
        status: "rejected",
        sent_at: lastWeek.toISOString(),
        job: {
          id: "3",
          title: "Designer UX/UI",
          description:
            "Nous cherchons un designer UX/UI talentueux pour concevoir des interfaces utilisateur intuitives et attrayantes pour nos applications web et mobiles.",
          entreprise: {
            id: "3",
            first_name: "Agence",
            surname: "Créative",
          },
        },
      },
    ]

    setInvitations(demoInvitations)
    setUsingDemoData(true)
    setError(null)
    setLoading(false)

    // Afficher un toast pour informer l'utilisateur
    toast({
      title: "Mode démonstration activé",
      description: "Ces invitations sont des exemples et ne reflètent pas les données réelles.",
      variant: "warning",
    })
  }
}
