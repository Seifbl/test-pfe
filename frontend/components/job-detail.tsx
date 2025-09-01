"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { jobService } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Calendar, DollarSign, ChevronLeft, Building, CheckCircle, MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

interface Job {
  id: string
  title: string
  description: string
  company_first_name: string
  company_surname: string
  company_id: string // ID de l'entreprise
  experience_level: string
  skills: string[]
  salary: string
  created_at: string
  duration?: string
}

interface JobDetailProps {
  jobId: string
}

const JobDetail = ({ jobId }: JobDetailProps) => {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`Récupération des détails du job avec l'ID: ${jobId}`)

        // Utiliser le service pour récupérer les détails du job
        const response = await jobService.getPublicJobById(jobId || "")
        console.log("Réponse de l'API:", response.data)

        setJob(response.data)

        // Vérifier si l'utilisateur a déjà postulé
        if (isAuthenticated && user?.id && user.userType === "freelancer") {
          try {
            // Vérification directe via l'API
            const checkResponse = await fetch(`/api/job-applications/check?jobId=${jobId}&freelanceId=${user.id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })

            if (checkResponse.ok) {
              const checkData = await checkResponse.json()
              console.log("Vérification de candidature:", checkData)
              setHasApplied(checkData.hasApplied)
            } else {
              console.log("Erreur lors de la vérification, on suppose que l'utilisateur n'a pas postulé")
              setHasApplied(false)
            }
          } catch (err) {
            console.error("Erreur lors de la vérification de la candidature:", err)
            setHasApplied(false)
          }
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des détails du job:", err)
        setError(err.response?.data?.message || "Une erreur est survenue lors du chargement des détails du job")
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobDetail()
    }
  }, [jobId, isAuthenticated, user])

  // Nouvelle implémentation directe avec fetch pour la candidature
  const handleApply = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour postuler à ce job.",
        variant: "destructive",
      })
      return
    }

    if (!user || user.userType !== "freelancer") {
      toast({
        title: "Action non autorisée",
        description: "Seuls les freelances peuvent postuler aux offres.",
        variant: "destructive",
      })
      return
    }

    if (hasApplied) {
      toast({
        title: "Déjà postulé",
        description: "Vous avez déjà postulé à cette offre.",
        variant: "destructive",
      })
      return
    }

    try {
      setApplying(true)

      // Vérifier que l'ID utilisateur existe
      if (!user || !user.id) {
        console.error("ID utilisateur manquant:", user)
        toast({
          title: "Erreur",
          description: "Impossible d'identifier votre compte. Veuillez vous reconnecter.",
          variant: "destructive",
        })
        setApplying(false)
        return
      }

      console.log("Tentative de candidature avec:", { jobId, freelanceId: user.id })

      // Utiliser fetch directement pour plus de contrôle
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter pour postuler.",
          variant: "destructive",
        })
        setApplying(false)
        return
      }

      // Essayer d'abord l'endpoint principal
      try {
        const response = await fetch("/api/job-applications/apply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_id: jobId,
            freelance_id: user.id,
          }),
        })

        console.log("Statut de la réponse:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Candidature réussie:", data)
          setHasApplied(true)
          toast({
            title: "Candidature envoyée",
            description: "Votre candidature a été envoyée avec succès.",
          })
          return
        } else {
          const errorData = await response.text()
          console.error("Erreur lors de la candidature (1er endpoint):", errorData)

          // Si c'est une erreur de conflit (déjà postulé)
          if (response.status === 409) {
            setHasApplied(true)
            toast({
              title: "Déjà postulé",
              description: "Vous avez déjà postulé à cette offre.",
              variant: "destructive",
            })
            return
          }

          // Sinon, essayer le second endpoint
          throw new Error("Premier endpoint échoué")
        }
      } catch (firstError) {
        console.log("Tentative avec le second endpoint...")

        // Essayer le second endpoint
        const response = await fetch(`/api/jobs/${jobId}/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            freelance_id: user.id,
          }),
        })

        console.log("Statut de la réponse (2ème endpoint):", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Candidature réussie (2ème endpoint):", data)
          setHasApplied(true)
          toast({
            title: "Candidature envoyée",
            description: "Votre candidature a été envoyée avec succès.",
          })
        } else {
          const errorData = await response.text()
          console.error("Erreur lors de la candidature (2ème endpoint):", errorData)

          // Si c'est une erreur de conflit (déjà postulé)
          if (response.status === 409) {
            setHasApplied(true)
            toast({
              title: "Déjà postulé",
              description: "Vous avez déjà postulé à cette offre.",
              variant: "destructive",
            })
            return
          }

          // Si les deux endpoints échouent, essayer une méthode directe
          console.log("Tentative avec méthode directe...")

          // Essayer une méthode directe avec l'URL complète
          const directResponse = await fetch(`http://localhost:5000/api/job-applications/apply`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              job_id: jobId,
              freelance_id: user.id,
            }),
          })

          console.log("Statut de la réponse (méthode directe):", directResponse.status)

          if (directResponse.ok) {
            const data = await directResponse.json()
            console.log("Candidature réussie (méthode directe):", data)
            setHasApplied(true)
            toast({
              title: "Candidature envoyée",
              description: "Votre candidature a été envoyée avec succès.",
            })
          } else {
            const errorData = await directResponse.text()
            console.error("Erreur lors de la candidature (méthode directe):", errorData)
            throw new Error("Toutes les méthodes ont échoué")
          }
        }
      }
    } catch (err: any) {
      console.error("Erreur globale lors de la candidature:", err)

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  // Fonction pour accéder à la conversation
  const handleViewMessages = () => {
    if (!job?.company_id || !user?.id) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la conversation.",
        variant: "destructive",
      })
      return
    }

    // Rediriger vers la page de messagerie avec les bons paramètres
    router.push(`/messages/${jobId}/${job.company_id}`)
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Fonction pour générer les triangles de niveau d'expérience
  const renderExperienceLevel = (level: string) => {
    const levels: Record<string, number> = {
      Beginner: 1,
      Intermediate: 2,
      Expert: 3,
      Specialized: 4,
      Débutant: 1,
      Intermédiaire: 2,
      Confirmé: 2,
      Spécialisé: 4,
    }

    const levelValue = levels[level] || 1
    const totalLevels = 4

    return (
      <div className="flex gap-1 mt-2">
        {Array.from({ length: totalLevels }).map((_, index) => (
          <div
            key={index}
            className={`w-6 h-6 transform rotate-45 ${index < levelValue ? "bg-black" : "bg-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/talent/jobs" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/talent/jobs" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Retour aux offres
          </Link>
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
            <p>Aucune information trouvée pour ce job.</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculer la valeur estimée du contrat
  const calculateEstimatedValue = () => {
    // Extraire le taux horaire du format "50$/hr" ou similaire
    const rateMatch = job.salary.match(/(\d+)/)
    if (!rateMatch) return "N/A"

    const hourlyRate = Number.parseInt(rateMatch[1])

    // Estimer 160 heures par mois (40h/semaine)
    const monthlyHours = 160

    // Estimer la durée en mois (par défaut 3 mois si non spécifié)
    let durationInMonths = 3
    if (job.duration) {
      const durationMatch = job.duration.match(/(\d+)/)
      if (durationMatch) {
        durationInMonths = Number.parseInt(durationMatch[1])
      }
    }

    const estimatedValue = hourlyRate * monthlyHours * durationInMonths

    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(estimatedValue)
  }

  // Déterminer l'état du bouton de candidature
  const getApplyButton = () => {
    if (hasApplied) {
      return (
        <div className="flex gap-2">
          <Button disabled className="bg-green-600 text-white hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Déjà postulé
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleViewMessages}>
            <MessageSquare className="h-4 w-4" />
            Voir les messages
          </Button>
        </div>
      )
    }

    return (
      <Button
        onClick={handleApply}
        className="bg-black text-white hover:bg-gray-800"
        disabled={applying || !isAuthenticated || user?.userType !== "freelancer"}
      >
        {applying ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Envoi en cours...
          </>
        ) : (
          "Postuler"
        )}
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link href="/talent/jobs" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Retour aux offres
        </Link>

        {/* En-tête */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Building className="h-4 w-4" />
                <span>
                  {job.company_first_name} {job.company_surname}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Publié le {formatDate(job.created_at)}</span>
              </div>
            </div>
            {getApplyButton()}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Rôle et type de job */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Rôle et type de job</h2>
              <div className="flex items-start gap-2 text-gray-700">
                <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-gray-500">{job.experience_level}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expérience */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Expérience</h2>
              <div className="text-gray-700">{job.experience_level}</div>
              {renderExperienceLevel(job.experience_level)}
            </CardContent>
          </Card>

          {/* Taux */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Taux</h2>
              <div className="flex items-start gap-2 text-gray-700">
                <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">{job.salary}</div>
                  <div className="text-sm text-gray-500">Est. Valeur {calculateEstimatedValue()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compétences */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description du job */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Description du job</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </CardContent>
        </Card>

        {/* Tâches quotidiennes */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Les tâches quotidiennes</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Collaborer avec l'équipe de conception pour créer des interfaces utilisateur intuitives</li>
              <li>Développer des fonctionnalités front-end réactives et performantes</li>
              <li>Participer aux réunions d'équipe et aux sessions de planification</li>
              <li>Effectuer des tests et déboguer les applications</li>
              <li>Optimiser les applications pour une performance maximale</li>
            </ul>
          </CardContent>
        </Card>

        {/* Les essentiels */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Les essentiels</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Expérience en développement web avec {job.skills.join(", ")}</li>
              <li>Connaissance des principes de conception UI/UX</li>
              <li>Capacité à travailler en équipe et à communiquer efficacement</li>
              <li>Autonomie et rigueur dans le travail</li>
              <li>Passion pour l'apprentissage continu et les nouvelles technologies</li>
            </ul>
          </CardContent>
        </Card>

        {/* Bouton de candidature */}
        <div className="flex justify-center mt-8 mb-12">
          {hasApplied ? (
            <div className="text-center">
              <div className="flex gap-4 justify-center">
                <Button disabled className="bg-green-600 text-white hover:bg-green-700 px-8 py-6 text-lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Candidature envoyée
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-8 py-6 text-lg"
                  onClick={handleViewMessages}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Voir les messages
                </Button>
              </div>
              <p className="text-gray-600 mt-2">
                Votre candidature a été enregistrée. Consultez les messages pour communiquer avec l'entreprise.
              </p>
            </div>
          ) : (
            <Button
              onClick={handleApply}
              className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg"
              disabled={applying || !isAuthenticated || user?.userType !== "freelancer"}
            >
              {applying ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Envoi en cours...
                </>
              ) : (
                "Postuler maintenant"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobDetail
