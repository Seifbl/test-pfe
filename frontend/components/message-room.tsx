"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { jobService } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { io, type Socket } from "socket.io-client"
import { ChevronLeft, Send, User, Briefcase, MessageSquare } from "lucide-react"
import Link from "next/link"
import { messageService } from "@/services/message-service"

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
}

interface OtherUser {
  id: string
  first_name?: string
  last_name?: string
  email: string
  userType: "freelancer" | "company"
}

interface MessageRoomProps {
  jobId: string
  otherUserId: string
}

const MessageRoom = ({ jobId, otherUserId }: MessageRoomProps) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<Job | null>(null)
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const API_URL = process.env.API_BASE_URL || "http://localhost:5000/api"
  const SOCKET_URL = process.env.API_BASE_URL_SOCKET || "http://localhost:5000"

  // --- Connexion socket.io ---
  useEffect(() => {
    if (!user?.id) return

    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    // Connexion au namespace /messages avec les paramètres requis
    socketRef.current = io(`${SOCKET_URL}/messages`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { 
        userId: user.id, 
        jobId, 
        otherUserId 
      },
    })

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connecté au namespace /messages avec ID:", socketRef.current?.id)
      console.log("📋 Paramètres de connexion:", { userId: user.id, jobId, otherUserId })
      setSocketConnected(true)
    })

    socketRef.current.on("disconnect", (reason) => {
      console.log("🚪 Socket déconnecté:", reason)
      setSocketConnected(false)
    })

    socketRef.current.on("message", (message: Message) => {
      console.log("📩 Message reçu via socket:", message)
      
      setMessages((prev) => {
        // Vérifier si le message existe déjà pour éviter les doublons
        const messageExists = prev.some(msg => msg.id === message.id)
        if (messageExists) {
          return prev
        }
        
        // ✅ Calculer fromMe correctement basé sur sender_id (fix type mismatch)
        const isFromCurrentUser = String(message.sender_id) === String(user.id)
        console.log(`🔍 Socket message ${message.id}: sender=${message.sender_id} (${typeof message.sender_id}), user=${user.id} (${typeof user.id}), isFromCurrentUser=${isFromCurrentUser}`)
        
        const messageWithCorrectFromMe = {
          ...message,
          fromMe: isFromCurrentUser
        }
        
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

    return () => {
      if (socketRef.current) {
        console.log("🧹 Nettoyage de la connexion socket")
        socketRef.current.disconnect()
      }
    }
  }, [user?.id, jobId, otherUserId])

  // --- Chargement initial ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      setLoading(true)

      try {
        // Job
        if (jobId !== "general") {
          try {
            const { data } = await jobService.getJobById(jobId)
            setJob(data)
          } catch (error) {
            console.error("Erreur lors de la récupération du job:", error)
            setJob({ id: jobId, title: `Offre d'emploi #${jobId}` })
          }
        } else {
          setJob({ id: "general", title: "Conversation générale" })
        }

        // Messages - Utiliser le service de message existant
        try {
          console.log(
            `Tentative de récupération des messages pour job=${jobId}, user1=${user.id}, user2=${otherUserId}`,
          )
          const messagesData = await messageService.getMessageHistory(jobId, user.id, otherUserId)
          console.log("Messages récupérés:", messagesData)

          // Vérifier si messagesData est un tableau
          const messagesArray = Array.isArray(messagesData) ? messagesData : [messagesData]
          
          const processedMessages = messagesArray.map((m: Message) => {
            // Fix potential type mismatch between user.id and sender_id
            const isFromCurrentUser = String(m.sender_id) === String(user.id)
            console.log(`🔍 Message ${m.id}: sender=${m.sender_id} (${typeof m.sender_id}), user=${user.id} (${typeof user.id}), isFromCurrentUser=${isFromCurrentUser}`)
            return { ...m, fromMe: isFromCurrentUser }
          })
          
          setMessages(processedMessages)
        } catch (error) {
          console.error("Erreur lors de la récupération des messages, tentative avec ordre inverse:", error)

          try {
            // Essayer avec l'ordre inverse des utilisateurs
            const messagesData = await messageService.getMessageHistory(jobId, otherUserId, user.id)
            console.log("Messages récupérés (ordre inverse):", messagesData)

            const messagesArray = Array.isArray(messagesData) ? messagesData : [messagesData]
            
            const processedMessages = messagesArray.map((m: Message) => {
              // Fix potential type mismatch between user.id and sender_id
              const isFromCurrentUser = String(m.sender_id) === String(user.id)
              console.log(`🔍 Fallback message ${m.id}: sender=${m.sender_id} (${typeof m.sender_id}), user=${user.id} (${typeof user.id}), isFromCurrentUser=${isFromCurrentUser}`)
              return { ...m, fromMe: isFromCurrentUser }
            })
            
            setMessages(processedMessages)
          } catch (secondError) {
            console.error("Échec de la récupération des messages même avec ordre inverse:", secondError)
            setMessages([])
          }
        }

        // Marquer lus - Utiliser l'API directe car non implémenté dans le service
        try {
          const token = localStorage.getItem("token")
          await fetch(`${API_URL}/messages/read`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              user_id: user.id,
              conversation_id: `${user.id}_${otherUserId}_${jobId}`,
            }),
          })
        } catch (error) {
          console.error("Erreur lors du marquage des messages comme lus:", error)
        }

        // Autre utilisateur
        try {
          const userTypeEndpoint =
            user.userType === "company"
              ? `${API_URL}/freelances/${otherUserId}`
              : `${API_URL}/entreprise/${otherUserId}`

          const token = localStorage.getItem("token")
          const userResponse = await fetch(userTypeEndpoint, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            setOtherUser({
              id: otherUserId,
              first_name: userData.first_name,
              last_name: userData.last_name || userData.surname,
              email: userData.email,
              userType: user.userType === "company" ? "freelancer" : "company",
            })
          } else {
            throw new Error(`Erreur HTTP ${userResponse.status}`)
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des informations de l'utilisateur:", error)
          setOtherUser({
            id: otherUserId,
            first_name: user.userType === "company" ? "Freelance" : "Entreprise",
            last_name: "Utilisateur",
            email: `utilisateur${otherUserId}@exemple.com`,
            userType: user.userType === "company" ? "freelancer" : "company",
          })
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement des données. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, jobId, otherUserId, toast])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // --- Envoyer un message ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user?.id) return

    const messageData = {
      sender_id: user.id,
      receiver_id: otherUserId,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // --- Render ---
  if (loading)
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32" />
          </CardContent>
        </Card>
      </div>
    )

  // Check for undefined otherUserId
  if (!otherUserId || otherUserId === "undefined") {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Link
          href={user?.userType === "company" ? "/company/messages" : "/talent/messages"}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-2" /> Retour aux messages
        </Link>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur d'identification</h2>
            <p className="text-gray-600 mb-4">
              Impossible d'identifier l'utilisateur pour cette conversation. Veuillez retourner à la liste des messages.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link
        href={user?.userType === "company" ? "/company/messages" : "/talent/messages"}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-2" /> Retour aux messages
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${otherUser?.first_name || "User"}`}
                />
                <AvatarFallback>
                  {otherUser?.userType === "company" ? <Briefcase className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {otherUser?.first_name} {otherUser?.last_name}
                </CardTitle>
                <CardDescription>{otherUser?.email}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{job?.title}</div>
              <div className={`text-xs mt-1 ${socketConnected ? "text-green-600" : "text-amber-600"}`}>
                {socketConnected ? "Connecté" : "Hors ligne"}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto p-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Aucun message pour le moment.</p>
                <p>Envoyez le premier message pour démarrer la conversation !</p>
              </div>
            ) : (
              messages.map((msg) => {
                // Ensure fromMe is correctly calculated (fix type mismatch)
                const isFromCurrentUser = String(msg.sender_id) === String(user?.id)
                console.log(`🎨 Render message ${msg.id}: sender=${msg.sender_id} (${typeof msg.sender_id}), user=${user?.id} (${typeof user?.id}), isFromCurrentUser=${isFromCurrentUser}`)
                
                return (
                  <div key={msg.id} className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"} mb-3`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        isFromCurrentUser 
                          ? "bg-blue-500 text-white rounded-br-sm" 
                          : "bg-gray-200 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 opacity-75 ${
                        isFromCurrentUser ? "text-blue-100" : "text-gray-600"
                      }`}>
                        {formatDate(msg.sent_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default MessageRoom
