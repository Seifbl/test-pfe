"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import api from "@/services/api"

// Define the types
type JobSection = "offers" | "applications" | "invites" | "my-jobs"
type JobStatus = "active" | "past" | "open" | "closed"
type Job = {
  id: string
  title: string
  company_first_name: string
  company_surname: string
  experience_level: string
  skills: string[]
  salary: string
  created_at: string
}
// Remove the Sidebar component since it's now part of the layout
export default function JobsPage() {
  const [activeSection, setActiveSection] = useState<JobSection>("offers")
  const [jobStatus, setJobStatus] = useState<JobStatus>("active")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Récupérer les jobs depuis l'API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await api.get("/jobs/public")
        console.log("Jobs récupérés:", response.data)
        setJobs(response.data)
        setError(null)
      } catch (err) {
        console.error("Erreur lors de la récupération des jobs:", err)
        setError("Impossible de charger les offres d'emploi. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Filtrer les jobs en fonction de la recherche
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.experience_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${job.company_first_name} ${job.company_surname}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "d MMM yyyy", { locale: fr })
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return dateString
    }
  }

  // Fonction pour naviguer vers la page de détail du job
  const handleViewJob = (jobId: string) => {
    router.push(`/talent/jobs/${jobId}`)
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Jobs</h1>
        </div>

        <Tabs defaultValue="offers" onValueChange={(value) => setActiveSection(value as JobSection)}>
          <TabsList className="mb-8">
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="offers">Job Offers</TabsTrigger>
            <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="offers">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, compétences, entreprise..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune offre d'emploi trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {job.company_first_name.charAt(0)}
                            {job.company_surname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>
                              {job.company_first_name} {job.company_surname}
                            </span>
                            <span>•</span>
                            <span>{job.experience_level}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-1">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">{job.salary}</div>
                          <div className="text-sm text-gray-500">Posted {formatDate(job.created_at)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="default" className="px-4" onClick={() => handleViewJob(job.id)}>
                            View Job
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications">
            <Tabs defaultValue="open" onValueChange={(value) => setJobStatus(value as JobStatus)}>
              <TabsList className="mb-4">
                <TabsTrigger value="open">Open Applications</TabsTrigger>
                <TabsTrigger value="closed">Closed Applications</TabsTrigger>
              </TabsList>
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune candidature pour le moment</p>
              </div>
            </Tabs>
          </TabsContent>

          <TabsContent value="invites">
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune invitation pour le moment</p>
            </div>
          </TabsContent>

          <TabsContent value="my-jobs">
            <Tabs defaultValue="active" onValueChange={(value) => setJobStatus(value as JobStatus)}>
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active Jobs</TabsTrigger>
                <TabsTrigger value="past">Past Jobs</TabsTrigger>
              </TabsList>
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun job actif pour le moment</p>
              </div>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
