"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import FreelanceRatingModal from "@/components/freelance-rating-modal"
import { jobService } from "@/services/api"
import ChatbotWidget from "@/components/chatbot-widget"
// Définir l'interface pour les jobs complétés
interface CompletedJob {
  id: number
  title: string
  assigned_freelance_name: string
  assigned_freelance_id: number
  assigned_freelance?: {
    id: number
    first_name: string
    last_name: string
    title?: string
    avatar?: string
  }
  completed_at: string
  duration?: string
}

export default function CompanyDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFreelance, setSelectedFreelance] = useState<{
    freelance: any
    jobId: number
    jobTitle: string
  } | null>(null)

  useEffect(() => {
    const fetchCompletedJobs = async () => {
      try {
        setLoading(true)
        const response = await jobService.getCompletedJobs()
        setCompletedJobs(response.data || [])
      } catch (error) {
        console.error("Erreur lors de la récupération des jobs complétés:", error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les missions terminées.",
          variant: "destructive",
        })
        // Utiliser des données de démonstration en cas d'erreur
        setCompletedJobs([
          {
            id: 1,
            title: "Senior Frontend Developer",
            assigned_freelance_name: "John Doe",
            completed_at: new Date().toISOString(),
            duration: "3 mois",
            assigned_freelance_id: 1,
          },
          {
            id: 2,
            title: "Backend Engineer",
            assigned_freelance_name: "Jane Smith",
            completed_at: new Date().toISOString(),
            duration: "6 mois",
            assigned_freelance_id: 2,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCompletedJobs()
  }, [toast])

  const handleRateFreelance = async (job: CompletedJob) => {
    try {
      // Si on a déjà les infos du freelance, les utiliser
      if (job.assigned_freelance) {
        setSelectedFreelance({
          freelance: job.assigned_freelance,
          jobId: job.id,
          jobTitle: job.title,
        })
        return
      }

      // Sinon, récupérer les infos du freelance assigné
      const response = await jobService.getAssignedFreelance(job.id.toString())
      const freelanceData = response.data

      setSelectedFreelance({
        freelance: {
          id: job.assigned_freelance_id,
          first_name: freelanceData.first_name || "Freelance",
          last_name: freelanceData.last_name || "",
          title: freelanceData.title,
          avatar: freelanceData.avatar,
        },
        jobId: job.id,
        jobTitle: job.title,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des infos du freelance:", error)
      // Utiliser les données minimales disponibles
      setSelectedFreelance({
        freelance: {
          id: job.assigned_freelance_id,
          first_name: job.assigned_freelance_name.split(" ")[0] || "Freelance",
          last_name: job.assigned_freelance_name.split(" ").slice(1).join(" ") || "",
          title: undefined,
          avatar: undefined,
        },
        jobId: job.id,
        jobTitle: job.title,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your company's activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 closing soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+28% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 days</div>
            <p className="text-xs text-muted-foreground">Industry avg: 22 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>Your most recent job listings</CardDescription>
            </div>
            <Button asChild>
              <Link href="/company/jobs/create">Post New Job</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((job) => (
              <div key={job} className="flex flex-col space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Senior Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground">Remote • Full-time • Posted 5 days ago</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    12 applicants
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">React</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    TypeScript
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Next.js</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/company/jobs/${job}/edit`}>Edit</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/company/jobs/${job}/invite`}>Invite Talent</Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/company/jobs">Manage All Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Candidates</CardTitle>
            <CardDescription>Highly matched candidates for your jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((candidate) => (
              <div key={candidate} className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <h3 className="font-semibold">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Senior Frontend Developer • 5 years exp.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    95% match
                  </span>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-center">
              <Button variant="outline">View All Candidates</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section des jobs complétés */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Missions terminées</CardTitle>
            <CardDescription>Les missions que vous avez marquées comme terminées</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                ))}
              </div>
            ) : completedJobs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Vous n'avez pas encore de missions terminées.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedJobs.map((job) => (
                  <div key={job.id} className="flex flex-col space-y-2 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Freelance: {job.assigned_freelance_name} • Terminée le:{" "}
                          {new Date(job.completed_at).toLocaleDateString()}
                        </p>
                        {job.duration && <p className="text-sm text-muted-foreground">Durée: {job.duration}</p>}
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Terminée
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/company/jobs/${job.id}`}>Voir les détails</Link>
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleRateFreelance(job)}>
                        Noter ce freelance
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modale de notation */}
      {selectedFreelance && (
        <FreelanceRatingModal
          isOpen={!!selectedFreelance}
          onClose={() => setSelectedFreelance(null)}
          freelance={selectedFreelance.freelance}
          jobId={selectedFreelance.jobId}
          jobTitle={selectedFreelance.jobTitle}
        />
      )}
         {/* Widget de chatbot */}
            <ChatbotWidget />
    </div>
  )
}
