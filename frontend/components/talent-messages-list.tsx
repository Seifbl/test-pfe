"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, Calendar, MessageSquare } from "lucide-react"
import { messageService } from "@/services/message-service"
import { io, type Socket } from "socket.io-client"
import Link from "next/link"

interface Conversation {
  conversation_id?: string
  job_id: string
  job_title: string
  company_id: string
  company_name: string
  last_message: {
    content: string
    sent_at: string
    sender_id: string
  }
  unread_count: number
}

const TalentMessagesList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)
  const SOCKET_URL = process.env.API_BASE_URL_SOCKET || "http://localhost:5000"

  // Fonction pour récupérer les conversations
  const fetchConversations = async () => {
    try {
      if (!user?.id) return

      console.log("📋 Récupération des conversations pour l'utilisateur:", user.id)

      const data = await messageService.getUserConversations(user.id)
      console.log("✅ Conversations récupérées:", data)

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log("ℹ️ Aucune conversation trouvée")
        setConversations([])
      } else {
        setConversations(Array.isArray(data) ? data : [data])
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des conversations:", error)
      if (error instanceof Error) {
        console.error("Message d'erreur:", error.message)
      }
      setConversations([])
      toast({
        title: "Erreur",
        description: "Impossible de charger vos conversations. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  // Chargement initial des conversations
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      await fetchConversations()
      setLoading(false)
    }

    loadInitialData()
  }, [user?.id, toast])

  // Connexion Socket.IO pour les mises à jour temps réel
  useEffect(() => {
    if (!user?.id) return

    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    // Connexion au socket global pour les notifications de nouveaux messages
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { userId: user.id },
    })

    socketRef.current.on("connect", () => {
      console.log("🔔 Socket connecté pour les notifications de conversations")
      setSocketConnected(true)
    })

    socketRef.current.on("disconnect", (reason) => {
      console.log("🚪 Socket déconnecté:", reason)
      setSocketConnected(false)
    })

    // Écouter les nouveaux messages pour mettre à jour la liste
    socketRef.current.on("newMessage", (messageData) => {
      console.log("📩 Nouveau message reçu, mise à jour de la liste:", messageData)
      // Recharger les conversations pour avoir la liste à jour
      fetchConversations()
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion socket:", error)
      setSocketConnected(false)
    })

    return () => {
      if (socketRef.current) {
        console.log("🧹 Nettoyage de la connexion socket des conversations")
        socketRef.current.disconnect()
      }
    }
  }, [user?.id])

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    // Si c'est aujourd'hui, afficher l'heure
    if (date.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    }

    // Si c'est cette année, afficher le jour et le mois
    if (date.getFullYear() === now.getFullYear()) {
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
      }).format(date)
    }

    // Sinon afficher la date complète
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const handleConversationClick = (conversation: Conversation) => {
    // Naviguer vers la page de conversation
    if (conversation.job_id) {
      console.log(`Navigating to conversation: /talent/messages/${conversation.job_id}`)
      router.push(`/talent/messages/${conversation.job_id}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full max-w-md mb-1" />
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mes messages</h1>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun message</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore de conversations. Postulez à des offres d'emploi pour commencer à échanger avec des
              entreprises.
            </p>
            <Link href="/talent/jobs">
              <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800">
                Voir les offres
              </div>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.conversation_id || `${conversation.job_id}_${conversation.company_id}`}
              onClick={() => handleConversationClick(conversation)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.company_name}`}
                      />
                      <AvatarFallback>
                        <Briefcase className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{conversation.company_name}</h3>
                        <span className="text-xs text-gray-500">
                          {conversation.last_message && conversation.last_message.sent_at
                            ? formatDate(conversation.last_message.sent_at)
                            : "Nouveau"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{conversation.job_title}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {conversation.last_message ? conversation.last_message.content : "Démarrer la conversation"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {conversation.job_id === "general"
                            ? "Conversation générale"
                            : `Offre d'emploi #${conversation.job_id}`}
                        </span>
                      </div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-black text-white">{conversation.unread_count}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TalentMessagesList
