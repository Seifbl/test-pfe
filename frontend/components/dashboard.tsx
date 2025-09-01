"use client"

import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BriefcaseIcon, ClockIcon, StarIcon, TrendingUpIcon, BellIcon } from "lucide-react"
import Link from "next/link"
import { routes } from "@/constants/routes"
import { useState, useEffect } from "react"
import { FreelanceInvitations } from "./freelance-invitations"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import axios from "axios"
import ChatbotWidget from "./chatbot-widget"
import { FreelanceRatingsSection } from "./freelance-ratings-section"

// Mettre à jour l'interface Notification pour correspondre au format de l'API
interface Notification {
  id: number
  user_id: number
  user_role: string
  type: "assignment" | "invitation_response" | string
  title: string
  message: string
  job_id?: number
  read: boolean
  created_at: string
}

// Modifier la fonction Dashboard pour ajouter la section des notifications
export default function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // Fallback if user data is not available
  const userName = user?.firstName || "User"

  // Corriger la fonction fetchNotifications pour utiliser l'URL correcte
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true)
      setIsDemo(false)

      try {
        // Récupérer le token depuis localStorage
        const token = localStorage.getItem("token")

        if (!token) {
          console.error("Token d'authentification manquant")
          throw new Error("Token d'authentification manquant")
        }

        console.log("Token récupéré:", token.substring(0, 10) + "...")
        console.log("Tentative de récupération des notifications depuis: http://localhost:5000/api/notifications")

        const response = await axios.get("http://localhost:5000/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Réponse de l'API:", response)
        console.log("Notifications récupérées avec succès:", response.data)

        if (Array.isArray(response.data)) {
          setNotifications(response.data)
        } else {
          console.error("Format de réponse inattendu:", response.data)
          throw new Error("Format de réponse inattendu")
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error)
        console.log("Utilisation des données de démonstration pour les notifications")

        // Données de démonstration en cas d'erreur
        const demoNotifications = [
          {
            id: 1,
            user_id: 7,
            user_role: "entreprise",
            type: "invitation_response",
            title: "Invitation acceptée",
            message: "Un freelance a accepté votre invitation.",
            job_id: 10,
            read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            user_id: 7,
            user_role: "entreprise",
            type: "assignment",
            title: "Nouvelle mission",
            message: "Une nouvelle mission a été créée.",
            job_id: 11,
            read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ]

        setNotifications(demoNotifications)
        setIsDemo(true)
      } finally {
        setNotificationsLoading(false)
      }
    }

    // Appeler fetchNotifications seulement si l'utilisateur est connecté
    if (user?.id) {
      fetchNotifications()
    } else {
      console.log("Utilisateur non connecté, impossible de récupérer les notifications")
      setNotificationsLoading(false)
    }
  }, [user?.id])

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr })
    } catch (error) {
      return dateString
    }
  }

  // Fonction pour obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />
      case "invitation_response":
        return <StarIcon className="h-5 w-5 text-green-500" />
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your activity and opportunities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+5 new since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 in review, 2 accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <StarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Add work history to reach 100%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Section des invitations */}
        <Card className="col-span-2 lg:col-span-1">
          <FreelanceInvitations />
        </Card>

        {/* Section des jobs recommandés */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
            <CardDescription>Jobs that match your skills and experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((job) => (
              <div key={job} className="flex flex-col space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Senior Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground">TechCorp Inc. • Remote • Full-time</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">New</span>
                </div>
                <p className="text-sm">
                  Looking for an experienced developer with React, TypeScript, and Next.js skills...
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">React</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    TypeScript
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Next.js</span>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={routes.talent.jobDetail(job.toString())}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href={routes.talent.jobs}>View All Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section de complétion du profil */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to attract more opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Basic Information</span>
                <span className="text-xs text-green-600">Completed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Skills</span>
                <span className="text-xs text-green-600">Completed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Work History</span>
                <span className="text-xs text-amber-600">In Progress</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Portfolio</span>
                <span className="text-xs text-red-600">Not Started</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-red-500" style={{ width: "0%" }}></div>
              </div>
            </div>
            <Button className="w-full" asChild>
              <Link href={routes.talent.profile}>Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
            {/* Section des avis clients */}
      <div className="mb-8">
        <FreelanceRatingsSection />
      </div>

      {/* Nouvelle section pour les notifications */}
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Mes notifications</CardTitle>
              <CardDescription>Vos dernières notifications et mises à jour</CardDescription>
            </div>
            {isDemo && <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Mode démo</div>}
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                Vous n'avez pas de notifications pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border p-4 ${notification.read ? "" : "bg-blue-50 dark:bg-blue-900/10"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                        {notification.job_id && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={routes.talent.jobDetail(notification.job_id.toString())}>Voir le job</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          {/* Widget de chatbot */}
      <ChatbotWidget />
      </div>
    </div>
  )
}
