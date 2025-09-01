"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { User, Calendar, MessageSquare, ChevronLeft, CheckCircle, Info, X } from "lucide-react"
import { applicationService, jobService } from "@/services/api"

interface Freelance {
  id: string
  freelance_id?: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  title?: string
  bio?: string
  skills?: string[]
  experience_level?: string
  applied_at: string
}

interface AssignedFreelance {
  id: number | string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
}

interface Job {
  id: string
  title: string
  assigned_freelance_id?: string | null
}

interface ApplicationsListProps {
  jobId: string
}

const ApplicationsList = ({ jobId }: ApplicationsListProps) => {
  const [applications, setApplications] = useState<Freelance[]>([])
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactingFreelance, setContactingFreelance] = useState<string | null>(null)
  const [assigningFreelance, setAssigningFreelance] = useState<string | null>(null)
  const [assignedFreelance, setAssignedFreelance] = useState<AssignedFreelance | null>(null)
  const [loadingAssignedFreelance, setLoadingAssignedFreelance] = useState(false)
  const [showAssignedFreelance, setShowAssignedFreelance] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const API_URL = process.env.API_BASE_URL || "http://localhost:5000/api"
  const router = useRouter()

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        setError(null)

        // Récupérer les détails du job
        const jobResponse = await jobService.getJobById(jobId)
        setJob(jobResponse.data)

        // Récupérer les candidatures
        const applicationsResponse = await applicationService.getApplicationsByJobId(jobId)

        // Log pour déboguer les données reçues
        console.log("Données des candidatures reçues:", applicationsResponse.data)

        // Vérifier que chaque candidature a un ID de freelance valide
        const validApplications = applicationsResponse.data.map((app) => {
          // Si l'API renvoie directement freelance_id, l'utiliser
          // Sinon, utiliser l'ID de l'application comme fallback
          const freelanceId = app.freelance_id || app.id

          return {
            ...app,
            freelance_id: freelanceId,
          }
        })

        setApplications(validApplications)
      } catch (err: any) {
        console.error("Erreur lors de la récupération des candidatures:", err)
        setError(err.response?.data?.message || "Une erreur est survenue lors du chargement des candidatures")
        toast({
          title: "Erreur",
          description: "Impossible de charger les candidatures",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchApplications()
    }
  }, [jobId, toast])

  // Fonction pour récupérer le freelance assigné
  const fetchAssignedFreelance = async () => {
    try {
      setLoadingAssignedFreelance(true)
      setShowAssignedFreelance(true)

      const response = await jobService.getAssignedFreelance(jobId)
      setAssignedFreelance(response.data)

      console.log("Freelance assigné:", response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération du freelance assigné:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations du freelance assigné.",
        variant: "destructive",
      })
      setAssignedFreelance(null)
    } finally {
      setLoadingAssignedFreelance(false)
    }
  }

  // Fonction pour contacter un freelance
  const handleContactFreelance = async (freelanceId: string) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour contacter ce freelance",
        variant: "destructive",
      })
      return
    }

    try {
      setContactingFreelance(freelanceId)

      // Envoyer un message initial pour créer la conversation
      const initialMessage = {
        sender_id: user.id,
        receiver_id: freelanceId,
        job_id: jobId,
        content:
          "Bonjour, nous avons bien reçu votre candidature pour notre offre d'emploi. Pouvons-nous discuter de votre profil ?",
      }

      await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initialMessage),
      })

      // Rediriger vers la page de messagerie
      router.push(`/messages/${jobId}/${freelanceId}`)

      toast({
        title: "Conversation créée",
        description: "Vous pouvez maintenant échanger des messages avec ce freelance.",
      })
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setContactingFreelance(null)
    }
  }

  // Fonction pour affecter un freelance à un job
  const handleAssignFreelance = async (freelanceId: string) => {
    try {
      setAssigningFreelance(freelanceId)

      // Utiliser directement le service API au lieu de fetch
      await jobService.assignFreelance(jobId, freelanceId)

      // Mettre à jour l'état local du job
      setJob((prev) => (prev ? { ...prev, assigned_freelance_id: freelanceId } : null))

      toast({
        title: "Freelance affecté",
        description: "Le freelance a été affecté à cette mission avec succès.",
      })

      // Rafraîchir les données
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Erreur lors de l'affectation du freelance:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'affecter ce freelance à la mission. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setAssigningFreelance(null)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: "accepted" | "rejected") => {
    try {
      // Appeler l'API pour mettre à jour le statut de la candidature
      await fetch(`${API_URL}/job-applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      // Mettre à jour l'état local
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))

      toast({
        title: "Statut mis à jour",
        description: `La candidature a été ${newStatus === "accepted" ? "acceptée" : "refusée"}.`,
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-full mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/company/jobs" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Retour aux offres
          </Link>
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link href="/company/jobs" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Retour aux offres
        </Link>

        {/* En-tête */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Candidatures pour : {job?.title || "Offre d'emploi"}</h1>
              <p className="text-gray-600">
                {applications.length} candidature{applications.length !== 1 ? "s" : ""} reçue
                {applications.length !== 1 ? "s" : ""}
              </p>
            </div>

            {job?.assigned_freelance_id && (
              <Button
                variant="outline"
                className="mt-2 md:mt-0 flex items-center gap-2"
                onClick={fetchAssignedFreelance}
                disabled={loadingAssignedFreelance}
              >
                {loadingAssignedFreelance ? <span className="animate-spin">⏳</span> : <Info className="h-4 w-4" />}
                Voir le freelance assigné
              </Button>
            )}
          </div>

          {job?.assigned_freelance_id && !showAssignedFreelance && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Un freelance a déjà été assigné à cette mission
              </p>
            </div>
          )}

          {/* Affichage du freelance assigné */}
          {showAssignedFreelance && assignedFreelance && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowAssignedFreelance(false)}
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Freelance assigné à cette mission
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700 font-medium">Nom</p>
                  <p className="text-gray-900">
                    {assignedFreelance.first_name} {assignedFreelance.last_name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-700 font-medium">Email</p>
                  <a href={`mailto:${assignedFreelance.email}`} className="text-blue-600 hover:underline">
                    {assignedFreelance.email}
                  </a>
                </div>

                {assignedFreelance.phone_number && (
                  <div>
                    <p className="text-gray-700 font-medium">Téléphone</p>
                    <a href={`tel:${assignedFreelance.phone_number}`} className="text-blue-600 hover:underline">
                      {assignedFreelance.phone_number}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleContactFreelance(assignedFreelance.id.toString())}
                >
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </Button>

                <Link href={`/company/freelances/${assignedFreelance.id}`}>
                  <Button className="bg-black text-white hover:bg-gray-800">Voir le profil complet</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Liste des candidatures */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">Aucune candidature n'a encore été reçue pour cette offre.</p>
              <Link href="/company/jobs">
                <Button variant="outline">Retour aux offres</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((freelance) => (
              <Card
                key={freelance.id}
                className={
                  job?.assigned_freelance_id === (freelance.freelance_id || freelance.id) ? "border-green-200" : ""
                }
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">
                          {freelance.first_name} {freelance.last_name}
                        </h2>
                        {job?.assigned_freelance_id === (freelance.freelance_id || freelance.id) && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Assigné</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">{freelance.title || "Freelance"}</p>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>Candidature reçue le {formatDate(freelance.applied_at)}</span>
                      </div>

                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <a href={`mailto:${freelance.email}`} className="text-gray-700 hover:underline">
                            {freelance.email}
                          </a>
                        </div>
                        {freelance.phone_number && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <a href={`tel:${freelance.phone_number}`} className="text-gray-700 hover:underline">
                              {freelance.phone_number}
                            </a>
                          </div>
                        )}
                      </div>

                      {freelance.skills && freelance.skills.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {freelance.skills.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800">
                                {skill}
                              </Badge>
                            ))}
                            {freelance.skills.length > 5 && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                +{freelance.skills.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {freelance.bio && <p className="text-gray-700 mt-2 line-clamp-2">{freelance.bio}</p>}
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <Link href={`/company/freelances/${freelance.freelance_id || freelance.id}`}>
                        <Button className="w-full md:w-auto bg-black text-white hover:bg-gray-800">
                          Voir le profil
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full md:w-auto flex items-center gap-2"
                        onClick={() => handleContactFreelance(freelance.freelance_id || freelance.id)}
                        disabled={contactingFreelance === (freelance.freelance_id || freelance.id)}
                      >
                        {contactingFreelance === (freelance.freelance_id || freelance.id) ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Création...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4" />
                            Contacter
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className={`w-full md:w-auto flex items-center gap-2 ${
                          job?.assigned_freelance_id === (freelance.freelance_id || freelance.id)
                            ? "bg-green-50 text-green-700 border-green-200"
                            : ""
                        }`}
                        onClick={() => handleAssignFreelance(freelance.freelance_id || freelance.id)}
                        disabled={
                          assigningFreelance === (freelance.freelance_id || freelance.id) ||
                          job?.assigned_freelance_id === (freelance.freelance_id || freelance.id)
                        }
                      >
                        {assigningFreelance === (freelance.freelance_id || freelance.id) ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Affectation...
                          </>
                        ) : job?.assigned_freelance_id === (freelance.freelance_id || freelance.id) ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Affecté
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Affecter
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationsList
