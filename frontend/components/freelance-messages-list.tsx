"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, MessageSquare } from "lucide-react"

interface Conversation {
  id: string
  job_id: string
  job_title: string
  company_id: string
  company_name: string
  last_message: string
  last_message_date: string
  unread_count: number
}

const FreelanceMessagesList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        // Dans un environnement réel, cette API devrait exister
        // Ici, nous simulons la réponse

        // Simuler un appel API
        console.log("Récupération des conversations pour le freelance:", user.id)

        // Attendre pour simuler le chargement
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Données simulées - dans un environnement réel, ces données viendraient de l'API
        const mockConversations: Conversation[] = [
          {
            id: "conv1",
            job_id: "job123",
            job_title: "Développeur Frontend React",
            company_id: "comp456",
            company_name: "TechCorp",
            last_message:
              "Bonjour, nous avons examiné votre candidature et nous aimerions en savoir plus sur votre expérience.",
            last_message_date: new Date(Date.now() - 3600000).toISOString(), // 1 heure avant
            unread_count: 2,
          },
          {
            id: "conv2",
            job_id: "job456",
            job_title: "UX Designer Senior",
            company_id: "comp789",
            company_name: "DesignStudio",
            last_message: "Merci pour votre réponse. Seriez-vous disponible pour un appel cette semaine?",
            last_message_date: new Date(Date.now() - 86400000).toISOString(), // 1 jour avant
            unread_count: 0,
          },
          {
            id: "conv3",
            job_id: "job789",
            job_title: "Développeur Backend Node.js",
            company_id: "comp123",
            company_name: "ServerSolutions",
            last_message: "Nous vous confirmons que votre candidature a été retenue pour la prochaine étape.",
            last_message_date: new Date(Date.now() - 259200000).toISOString(), // 3 jours avant
            unread_count: 1,
          },
        ]

        setConversations(mockConversations)
      } catch (error) {
        console.error("Erreur lors de la récupération des conversations:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos conversations. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user, toast])

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Aujourd'hui - afficher l'heure
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } else if (diffDays === 1) {
      // Hier
      return "Hier"
    } else if (diffDays < 7) {
      // Cette semaine - afficher le jour
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
      }).format(date)
    } else {
      // Plus ancien - afficher la date complète
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Mes messages</h1>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun message</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore de conversations. Postulez à des offres pour commencer à échanger avec des
              entreprises.
            </p>
            <Link href="/talent/jobs">
              <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800">
                Parcourir les offres
              </div>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/messages/${conversation.job_id}/${conversation.company_id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.company_name}`}
                      />
                      <AvatarFallback>
                        <Briefcase className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-lg">{conversation.company_name}</h3>
                        <span className="text-sm text-gray-500">{formatDate(conversation.last_message_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{conversation.job_title}</span>
                      </div>
                      <p className="text-gray-700 line-clamp-1">{conversation.last_message}</p>
                      {conversation.unread_count > 0 && (
                        <div className="mt-2">
                          <Badge className="bg-black text-white">
                            {conversation.unread_count} nouveau{conversation.unread_count > 1 ? "x" : ""}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default FreelanceMessagesList
