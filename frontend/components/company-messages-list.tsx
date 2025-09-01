"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { User, MessageSquare, Calendar } from "lucide-react"
// Ajouter l'import du messageService en haut du fichier, après les autres imports
import { messageService } from "@/services/message-service"

interface Conversation {
  conversation_id?: string
  job_id: string
  job_title: string
  freelance_id: string
  freelance_name: string
  last_message: {
    content: string
    sent_at: string
    sender_id: string
  }
  unread_count: number
}

const CompanyMessagesList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Utiliser le service de message au lieu de fetch direct
        let data = []

        try {
          // Essayer d'abord avec le service de message
          data = await messageService.getUserConversations(user.id)
          console.log("Conversations récupérées via service:", data)
        } catch (serviceError) {
          console.error("Erreur avec le service de message:", serviceError)

          // Essayer avec l'API directe comme fallback
          try {
            const response = await fetch(`${process.env.API_BASE_URL}/conversations/${user.id}`)

            if (!response.ok) {
              throw new Error(`Erreur HTTP: ${response.status}`)
            }

            data = await response.json()
            console.log("Conversations récupérées via fetch direct:", data)
          } catch (fetchError) {
            console.error("Erreur avec fetch direct:", fetchError)
            throw fetchError // Propager l'erreur pour le gestionnaire d'erreurs principal
          }
        }

        setConversations(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des conversations:", error)
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger vos conversations. Utilisation des données de démonstration.",
          variant: "destructive",
        })

        // Utiliser des données de démonstration en cas d'erreur
        setConversations(getDemoConversations())
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

  // Ajouter cette fonction pour les données de démonstration après la fonction formatDate

  const getDemoConversations = () => {
    return [
      {
        conversation_id: "demo1",
        job_id: "1",
        job_title: "Développeur Frontend React",
        freelance_id: "101",
        freelance_name: "Sophie Martin",
        last_message: {
          content: "Bonjour, je suis intéressé par votre offre. Pouvons-nous discuter des détails?",
          sent_at: new Date(Date.now() - 3600000).toISOString(), // 1 heure avant
          sender_id: "101",
        },
        unread_count: 1,
      },
      {
        conversation_id: "demo2",
        job_id: "2",
        job_title: "Data Scientist",
        freelance_id: "102",
        freelance_name: "Thomas Dubois",
        last_message: {
          content: "Merci pour les informations. Je vous enverrai mon portfolio demain.",
          sent_at: new Date(Date.now() - 86400000).toISOString(), // 1 jour avant
          sender_id: "user_id",
        },
        unread_count: 0,
      },
      {
        conversation_id: "demo3",
        job_id: "3",
        job_title: "UX/UI Designer",
        freelance_id: "103",
        freelance_name: "Emma Bernard",
        last_message: {
          content: "J'ai bien reçu votre proposition. Quand pourrions-nous organiser un appel?",
          sent_at: new Date(Date.now() - 259200000).toISOString(), // 3 jours avant
          sender_id: "103",
        },
        unread_count: 2,
      },
    ]
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
              Vous n'avez pas encore de conversations. Contactez des candidats pour commencer à échanger.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/company/jobs">
                <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800">
                  Voir mes offres
                </div>
              </Link>
              <button
                onClick={() => {
                  setLoading(true)
                  setConversations(getDemoConversations())
                  setLoading(false)
                  toast({
                    title: "Données de démonstration",
                    description: "Affichage des conversations de démonstration.",
                  })
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Charger des données de démo
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Link
              key={conversation.conversation_id || `${conversation.job_id}_${conversation.freelance_id}`}
              href={
                conversation.freelance_id
                  ? `/messages/${conversation.job_id || "general"}/${conversation.freelance_id}`
                  : "/company/messages"
              }
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.freelance_name}`}
                      />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-lg">{conversation.freelance_name}</h3>
                        <span className="text-sm text-gray-500">{formatDate(conversation.last_message.sent_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{conversation.job_title}</span>
                      </div>
                      <p className="text-gray-700 line-clamp-1">{conversation.last_message.content}</p>
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

export default CompanyMessagesList
