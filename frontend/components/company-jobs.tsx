"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Eye, AlertCircle, User, UserCheck } from "lucide-react"
import Link from "next/link"
import { routes } from "@/constants/routes"
import { jobService } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import JobCompletionButton from "@/components/job-completion-button"

// Type pour les jobs
interface Job {
  id: string
  title: string
  location?: string
  type?: string
  applicants?: number
  status: string
  postedDate: string
  description?: string
  duration?: string
  experience_level?: string
  skills?: string[]
  salary?: string
  is_draft: boolean
  is_completed?: boolean
  assigned_freelance_id?: string | null
}

export default function CompanyJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Charger les jobs au chargement du composant
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await jobService.getAllJobs()

        // Transformer les données pour correspondre à notre interface Job
        const formattedJobs = response.data.map((job: any) => ({
          id: job.id,
          title: job.title,
          location: job.location || "Remote",
          type: job.duration || "Full-time",
          applicants: job.applicants_count || 0,
          status: job.is_draft ? "draft" : "active",
          postedDate: job.created_at || new Date().toISOString(),
          description: job.description,
          duration: job.duration,
          experience_level: job.experience_level,
          skills: job.skills,
          salary: job.salary,
          is_draft: job.is_draft,
          is_completed: job.is_completed || false,
          assigned_freelance_id: job.assigned_freelance_id || null,
        }))

        setJobs(formattedJobs)
        setError(null)
      } catch (err) {
        console.error("Erreur lors de la récupération des jobs:", err)
        setError("Impossible de charger les offres d'emploi. Veuillez réessayer plus tard.")
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les offres d'emploi. Veuillez réessayer plus tard.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [toast])

  // Supprimer un job
  const handleDeleteJob = async () => {
    if (!jobToDelete) return

    try {
      await jobService.deleteJob(jobToDelete)

      // Mettre à jour la liste des jobs
      setJobs(jobs.filter((job) => job.id !== jobToDelete))

      toast({
        title: "Offre supprimée",
        description: "L'offre d'emploi a été supprimée avec succès.",
      })
    } catch (err) {
      console.error(`Erreur lors de la suppression du job ${jobToDelete}:`, err)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'offre d'emploi. Veuillez réessayer plus tard.",
      })
    } finally {
      setJobToDelete(null)
    }
  }

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-24" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gérer les offres</h1>
          <Button asChild>
            <Link href={routes.company.createJob}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Publier une nouvelle offre
            </Link>
          </Button>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Afficher un message si aucun job n'est disponible
  if (jobs.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gérer les offres</h1>
          <Button asChild>
            <Link href={routes.company.createJob}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Publier une nouvelle offre
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4 text-center">Vous n'avez pas encore publié d'offres d'emploi.</p>
            <Button asChild>
              <Link href={routes.company.createJob}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Publier votre première offre
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Afficher la liste des jobs
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gérer les offres</h1>
        <Button asChild>
          <Link href={routes.company.createJob}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Publier une nouvelle offre
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>
                    {job.location} • {job.type}
                  </CardDescription>
                </div>
                <Badge variant={job.status === "active" ? "default" : "secondary"}>
                  {job.status === "active" ? "Publié" : "Brouillon"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-4">Publié le: {new Date(job.postedDate).toLocaleDateString()}</span>
                <span>
                  {job.applicants} Candidat{job.applicants !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/company/jobs/${job.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir
                </Link>
              </Button>
              <div className="flex space-x-2">
                <Link href={`/company/jobs/${job.id}/applications`}>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <User className="h-4 w-4" />
                    Candidatures
                  </Button>
                </Link>

                <JobCompletionButton
                  jobId={job.id}
                  isCompleted={job.is_completed}
                  assignedFreelanceId={job.assigned_freelance_id}
                  onJobCompleted={(jobId) => {
                    // Mettre à jour l'état local du job
                    setJobs((prevJobs) => prevJobs.map((j) => (j.id === jobId ? { ...j, is_completed: true } : j)))
                  }}
                />

                {/* Nouveau bouton pour affecter un freelance */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                  onClick={() => {
                    window.location.href = `/company/jobs/${job.id}/applications?action=assign`
                  }}
                >
                  <UserCheck className="h-4 w-4" />
                  Affecter un freelance
                </Button>
                <Link href={`/company/jobs/${job.id}/invitations`}>
                  <Button variant="outline" size="sm">
                    Invitations
                  </Button>
                </Link>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/company/jobs/edit/${job.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setJobToDelete(job.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialogue de confirmation pour la suppression */}
      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette offre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'offre d'emploi sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
