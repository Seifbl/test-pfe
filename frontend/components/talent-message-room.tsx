"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { jobService } from "@/services/api"
import { messageService } from "@/services/message-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { io, type Socket } from "socket.io-client"
import { ChevronLeft, Send, Briefcase, MessageSquare } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  job_id: string
  content: string
  sent_at: string
  fromMe?: boolean
}

interface Job {
  id: string
  title: string
  company_id: string
  company_first_name: string
  company_surname: string
}

interface TalentMessageRoomProps {
  jobId: string
}

const TalentMessageRoom = ({ jobId }: TalentMessageRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<Job | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const SOCKET_URL = process.env.API_BASE_URL_SOCKET || "http://localhost:5000"
  const [isJobIdValid, setIsJobIdValid] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsJobIdValid(jobId !== null && jobId !== undefined && jobId !== "undefined")
  }, [jobId])

  // Check for undefined jobId
  if (!isJobIdValid) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href="/talent/messages" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Retour aux messages
        </Link>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur d'identification</h2>
            <p className="text-gray-600 mb-4">
              Impossible d'identifier l'offre d'emploi pour cette conversation. Veuillez retourner à la liste des
              messages.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initializeSocket = useCallback(() => {
    if (!user?.id || !jobId) return

    // Déconnexion du socket précédent si existant
    if (socketRef.current) {
      console.log("🧹 Déconnexion du socket précédent")
      socketRef.current.disconnect()
      socketRef.current = null
    }

    console.log("🔌 Tentative de connexion socket à:", SOCKET_URL)

    try {
      // 🔥 Connexion au namespace /messages (comme dans MessageRoom)
      socketRef.current = io(`${SOCKET_URL}/messages`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: {
          userId: user.id,
          jobId,
          otherUserId: companyId || "unknown", // ID de l'entreprise
        },
      })

      // Événements de connexion
      socketRef.current.on("connect", () => {
        console.log("✅ Socket connecté au namespace /messages avec ID:", socketRef.current?.id)
        console.log("📋 Paramètres de connexion:", { userId: user.id, jobId, otherUserId: companyId })
        setSocketConnected(true)
      })

      socketRef.current.on("disconnect", (reason) => {
        console.log("🚪 Socket déconnecté:", reason)
        setSocketConnected(false)
      })

      // 📩 Écouter les nouveaux messages
      socketRef.current.on("message", (message) => {
        console.log("📩 Message reçu via socket:", message)
        console.log("🔍 Debug fromMe - user.id:", user.id, "message.sender_id:", message.sender_id)
        console.log("🔍 Debug fromMe - Types:", typeof user.id, typeof message.sender_id)
        console.log("🔍 Debug fromMe - Égalité stricte:", user.id === message.sender_id)
        console.log("🔍 Debug fromMe - Égalité loose:", user.id == message.sender_id)
        
        setMessages((prev) => {
          // Vérifier si le message existe déjà pour éviter les doublons
          const messageExists = prev.some(msg => msg.id === message.id)
          if (messageExists) {
            console.log("⚠️ Message déjà existant, ignoré:", message.id)
            return prev
          }
          
          // ✅ Calculer fromMe correctement basé sur sender_id (fix type mismatch)
          const fromMe = String(user.id) === String(message.sender_id)
          
          const messageWithCorrectFromMe = {
            ...message,
            fromMe: fromMe
          }
          
          console.log("📝 Message final ajouté:", messageWithCorrectFromMe)
          return [...prev, messageWithCorrectFromMe]
        })
        
        // Faire défiler vers le bas automatiquement
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      })

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Erreur de connexion socket:", error)
        setSocketConnected(false)
      })

      socketRef.current.on("reconnect", (attemptNumber) => {
        console.log("🔄 Socket reconnecté après", attemptNumber, "tentatives")
        setSocketConnected(true)
      })

    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation du socket:", error)
      setSocketConnected(false)
    }
  }, [user?.id, jobId, companyId, SOCKET_URL])

  // Connexion au socket
  useEffect(() => {
    // Only initialize socket if jobId and user are available
    const shouldInitializeSocket = jobId && user?.id

    if (shouldInitializeSocket) {
      initializeSocket()
    }

    // Nettoyage à la déconnexion
    return () => {
      if (socketRef.current) {
        console.log("Nettoyage: déconnexion du socket")
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [initializeSocket, jobId, user?.id])

  // Récupérer les données initiales
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !jobId) return

      try {
        setLoading(true)
        setError(null)
        console.log("Chargement des données pour jobId:", jobId, "userId:", user.id)

        // Essayer d'abord de récupérer les conversations pour trouver l'ID de l'entreprise
        try {
          console.log("Récupération des conversations pour trouver l'ID de l'entreprise")
          const conversations = await messageService.getUserConversations(user.id)
          console.log("Conversations récupérées:", conversations)

          // Vérifier si conversations est un tableau et s'il contient des éléments
          if (!Array.isArray(conversations) || conversations.length === 0) {
            console.log("Aucune conversation trouvée ou format invalide:", conversations)
            throw new Error("Aucune conversation trouvée")
          }

          // Convertir jobId en nombre si c'est une chaîne pour la comparaison
          const numericJobId = typeof jobId === "string" ? Number.parseInt(jobId) : jobId

          // Rechercher la conversation correspondante avec plus de flexibilité
          const jobConversation = conversations.find((conv: any) => {
            // Vérifier différents formats possibles de job_id
            const convJobId = typeof conv.job_id === "string" ? Number.parseInt(conv.job_id) : conv.job_id
            return convJobId === numericJobId || conv.job_id === jobId
          })

          console.log("Conversation trouvée pour ce job:", jobConversation)

          if (jobConversation) {
            // Déterminer l'ID de l'entreprise avec plus de robustesse
            let company_id = jobConversation.company_id

            // Si company_id n'est pas disponible, essayer de le déduire de différentes façons
            if (!company_id) {
              // Essayer d'extraire l'ID de l'entreprise des différents champs possibles
              if (jobConversation.sender_id && jobConversation.sender_id !== user.id) {
                company_id = jobConversation.sender_id
                console.log("ID de l'entreprise déduit du sender_id:", company_id)
              } else if (jobConversation.receiver_id && jobConversation.receiver_id !== user.id) {
                company_id = jobConversation.receiver_id
                console.log("ID de l'entreprise déduit du receiver_id:", company_id)
              } else if (
                jobConversation.last_message &&
                jobConversation.last_message.sender_id &&
                jobConversation.last_message.sender_id !== user.id
              ) {
                company_id = jobConversation.last_message.sender_id
                console.log("ID de l'entreprise déduit du last_message.sender_id:", company_id)
              } else if (jobConversation.participants && Array.isArray(jobConversation.participants)) {
                // Chercher un participant qui n'est pas l'utilisateur actuel
                const otherParticipant = jobConversation.participants.find(
                  (p: any) => p.id !== user.id || p.user_id !== user.id,
                )
                if (otherParticipant) {
                  company_id = otherParticipant.id || otherParticipant.user_id
                  console.log("ID de l'entreprise déduit des participants:", company_id)
                }
              }
            }

            console.log("ID de l'entreprise identifié:", company_id)

            if (company_id) {
              setCompanyId(company_id)

              // Récupérer les messages avec l'ID de l'entreprise trouvé
              try {
                const messagesData = await messageService.getMessageHistory(jobId, user.id, company_id)
                console.log("Messages récupérés:", messagesData)

                const messagesArray = Array.isArray(messagesData) ? messagesData : messagesData ? [messagesData] : []

                const formattedMessages = messagesArray.map((msg: Message) => ({
                  ...msg,
                  fromMe: msg.sender_id === user.id,
                }))

                setMessages(formattedMessages)

                // Définir un job minimal à partir des données de conversation
                setJob({
                  id: jobId,
                  title: jobConversation.job_title || "Offre d'emploi",
                  company_id: company_id,
                  company_first_name: jobConversation.company_name?.split(" ")[0] || "Entreprise",
                  company_surname: jobConversation.company_name?.split(" ").slice(1).join(" ") || "",
                })

                // Essayer de récupérer les détails complets du job (mais ne pas bloquer si ça échoue)
                try {
                  const jobResponse = await jobService.getJobById(jobId)
                  console.log("Détails du job récupérés:", jobResponse.data)
                  setJob(jobResponse.data)
                } catch (jobError) {
                  console.log("Impossible de récupérer les détails complets du job, utilisation des données minimales")
                  // Continuer avec les données minimales du job
                }

                // 3. Joindre la Room socket
                if (socketRef.current?.connected && company_id) {
                  const roomName = `chat_${jobId}_${Math.min(Number(user.id), Number(company_id))}_${Math.max(Number(user.id), Number(company_id))}`
                  console.log("Rejoindre la room:", roomName)
                  socketRef.current.emit("joinRoom", roomName)
                }
              } catch (messageError) {
                console.error("Erreur lors de la récupération des messages:", messageError)
                toast({
                  title: "Erreur",
                  description: "Impossible de charger les messages pour cette conversation.",
                  variant: "destructive",
                })
              }
            } else {
              setError("Impossible d'identifier l'entreprise pour cette conversation.")
              toast({
                title: "Erreur",
                description: "Impossible d'identifier l'entreprise pour cette conversation.",
                variant: "destructive",
              })
            }
          } else {
            // Si aucune conversation n'est trouvée, essayer de récupérer les détails du job
            try {
              console.log("Aucune conversation trouvée, tentative de récupération des détails du job")
              const jobResponse = await jobService.getJobById(jobId)
              console.log("Détails du job récupérés:", jobResponse.data)
              setJob(jobResponse.data)

              const company_id = jobResponse.data.company_id
              setCompanyId(company_id)
              console.log("ID de l'entreprise récupéré:", company_id)

              // Essayer de récupérer les messages
              try {
                const messagesData = await messageService.getMessageHistory(jobId, user.id, company_id)
                console.log("Messages récupérés:", messagesData)

                const messagesArray = Array.isArray(messagesData) ? messagesData : messagesData ? [messagesData] : []

                const formattedMessages = messagesArray.map((msg: Message) => ({
                  ...msg,
                  fromMe: msg.sender_id === user.id,
                }))

                setMessages(formattedMessages)
              } catch (messageError) {
                console.error("Erreur lors de la récupération des messages:", messageError)
                // Continuer même sans messages
              }
            } catch (jobError) {
              console.error("Erreur lors de la récupération des détails du job:", jobError)
              setError("Aucune conversation trouvée pour cette offre d'emploi.")
              toast({
                title: "Erreur",
                description: "Aucune conversation trouvée pour cette offre d'emploi.",
                variant: "destructive",
              })
            }
          }
        } catch (convError) {
          console.error("Erreur lors de la récupération des conversations:", convError)

          // NOUVEAU: Essayer de récupérer directement les informations de l'entreprise
          try {
            console.log("Tentative de récupération directe des informations de l'entreprise")
            const companyInfo = await messageService.getCompanyInfoByJobId(jobId)

            if (companyInfo && companyInfo.id) {
              console.log("Informations de l'entreprise récupérées directement:", companyInfo)
              setCompanyId(companyInfo.id)

              // Créer un job minimal à partir des informations récupérées
              setJob({
                id: jobId,
                title: "Offre d'emploi",
                company_id: companyInfo.id,
                company_first_name: companyInfo.name?.split(" ")[0] || "Entreprise",
                company_surname: companyInfo.name?.split(" ").slice(1).join(" ") || "",
              })

              // Essayer de récupérer les messages
              try {
                const messagesData = await messageService.getMessageHistory(jobId, user.id, companyInfo.id)
                console.log("Messages récupérés:", messagesData)

                const messagesArray = Array.isArray(messagesData) ? messagesData : messagesData ? [messagesData] : []

                const formattedMessages = messagesArray.map((msg: Message) => ({
                  ...msg,
                  fromMe: msg.sender_id === user.id,
                }))

                setMessages(formattedMessages)

                // Joindre la Room socket si disponible
                if (socketRef.current?.connected) {
                  const roomName = `chat_${jobId}_${Math.min(Number(user.id), Number(companyInfo.id))}_${Math.max(Number(user.id), Number(companyInfo.id))}`
                  console.log("Rejoindre la room:", roomName)
                  socketRef.current.emit("joinRoom", roomName)
                }

                return // Sortir de la fonction si tout s'est bien passé
              } catch (msgError) {
                console.error("Erreur lors de la récupération des messages:", msgError)
                // Continuer pour afficher au moins les informations de base
              }
            }
          } catch (directError) {
            console.error("Échec de la récupération directe des informations de l'entreprise:", directError)
          }

          setError("Impossible de charger les conversations.")
          toast({
            title: "Erreur",
            description: "Impossible de charger les conversations.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erreur générale lors du chargement des données:", error)
        setError("Une erreur s'est produite lors du chargement de la conversation.")
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement de la conversation.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId, user, toast])

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user?.id || !companyId) return

    const messageData = {
      sender_id: user.id,
      receiver_id: companyId,
      job_id: jobId,
      content: newMessage.trim(),
    }

    try {
      console.log("📤 Envoi d'un message:", messageData)

      // Vider le champ de saisie immédiatement pour une meilleure UX
      setNewMessage("")

      // Envoyer via API REST - le backend se chargera d'émettre via Socket.IO
      const response = await messageService.sendMessage(messageData)
      console.log("✅ Message envoyé avec succès via API:", response)

      // ⚠️ NE PAS ajouter le message localement - Socket.IO s'en chargera
      // Le backend émettra le message via Socket.IO après sauvegarde
      
      // Scroll to bottom (au cas où)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      })
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du message:", error)
      
      // En cas d'erreur, remettre le contenu dans le champ
      setNewMessage(messageData.content)
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Skeleton className="h-4 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${i % 2 === 0 ? "bg-blue-100" : "bg-gray-100"} rounded-lg p-3`}>
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-20 mt-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href="/talent/messages" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Retour aux messages
        </Link>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-sm text-gray-500 mb-4">
              <p>ID de l'offre: {jobId}</p>
              <p>ID de l'utilisateur: {user?.id || "Non connecté"}</p>
              <p>ID de l'entreprise: {companyId || "Non identifié"}</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
              <Link href="/talent/messages">
                <Button>Retour aux messages</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Navigation */}
      <Link href="/talent/messages" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Retour aux messages
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${job?.company_first_name || "Company"}`}
                />
                <AvatarFallback>
                  <Briefcase className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {job?.company_first_name && job?.company_surname
                    ? `${job.company_first_name} ${job.company_surname}`
                    : "Entreprise"}
                </CardTitle>
                <CardDescription>Conversation concernant une offre d'emploi</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{job?.title || "Offre d'emploi"}</div>
              <div className="text-sm text-gray-500">ID: {jobId}</div>
              <div className={`text-xs mt-1 ${socketConnected ? "text-green-600" : "text-amber-600"}`}>
                {socketConnected ? "Connecté en temps réel" : "Mode hors ligne"}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto p-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Aucun message pour le moment.</p>
                <p>Envoyez le premier message pour démarrer la conversation !</p>
              </div>
            ) : (
              messages.map((message) => {
                // Ensure fromMe is correctly calculated (fix type mismatch)
                const isFromCurrentUser = String(message.sender_id) === String(user?.id)
                
                return (
                  <div key={message.id} className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"} mb-3`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        isFromCurrentUser 
                          ? "bg-blue-500 text-white rounded-br-sm" 
                          : "bg-gray-200 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 opacity-75 ${
                        isFromCurrentUser ? "text-blue-100" : "text-gray-600"
                      }`}>
                        {formatDate(message.sent_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={!newMessage.trim() || !companyId}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TalentMessageRoom
