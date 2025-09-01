"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { jobService } from "@/services/api"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Remove the direct CompanySidebar import and usage since it's now part of the layout
export default function CreateJobPage() {
  const router = useRouter()
  const { user } = useAuth()
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modifier la structure de jobData pour inclure un titre de projet
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    duration: "", // "short" or "long"
    experience_level: "",
    skills: [] as string[],
    salary: "",
    questions: [] as string[],
    is_draft: false,
  })

  const handleSkillAdd = (skill: string) => {
    if (!jobData.skills.includes(skill)) {
      setJobData({
        ...jobData,
        skills: [...jobData.skills, skill],
      })
    }
  }

  const handleSkillRemove = (skill: string) => {
    setJobData({
      ...jobData,
      skills: jobData.skills.filter((s) => s !== skill),
    })
  }

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Préparer les données pour l'API
      const apiData = {
        ...jobData,
        is_draft: asDraft,
        // Convertir les questions en tableau si c'est une chaîne
        questions: typeof jobData.questions === "string" ? [jobData.questions] : jobData.questions,
      }

      // Envoyer les données à l'API
      await jobService.createJob(apiData)

      // Rediriger vers la liste des jobs
      router.push("/company/jobs")
    } catch (err: any) {
      console.error("Erreur lors de la création du job:", err)
      setError(err.response?.data?.message || "Une erreur est survenue lors de la création du job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <main className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Let's set up your new job</h2>
          <Button className="bg-black hover:bg-gray-800 text-white">Set a new job</Button>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 max-w-4xl">
          {/* Project Title */}
          <div className="bg-gray-200 p-6 rounded-md mb-6">
            <label className="block text-sm font-medium mb-2">Project Title</label>
            <Input
              placeholder="Enter project title..."
              className="bg-gray-300 border-none"
              value={jobData.title}
              onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
              required
            />
          </div>

          {/* Project Description */}
          <div className="bg-gray-200 p-6 rounded-md">
            <label className="block text-sm font-medium mb-2">Project Description</label>
            <Textarea
              placeholder="Type..."
              className="bg-gray-300 border-none resize-none h-24"
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
              required
            />
          </div>

          {/* Job Duration */}
          <div className="bg-gray-200 p-6 rounded-md">
            <label className="block text-sm font-medium mb-4">How long will the Talent work on this job?</label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={jobData.duration === "short" ? "default" : "outline"}
                className={`flex-1 ${jobData.duration === "short" ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-700"}`}
                onClick={() => setJobData({ ...jobData, duration: "short" })}
              >
                Short Term
              </Button>
              <Button
                type="button"
                variant={jobData.duration === "long" ? "default" : "outline"}
                className={`flex-1 ${jobData.duration === "long" ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-700"}`}
                onClick={() => setJobData({ ...jobData, duration: "long" })}
              >
                Long Term
              </Button>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-gray-200 p-6 rounded-md">
            <label className="block text-sm font-medium mb-4">Experience</label>
            <div className="grid grid-cols-4 gap-2">
              {experienceLevels.map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={jobData.experience_level === level ? "default" : "outline"}
                  className={`${jobData.experience_level === level ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-700"}`}
                  onClick={() => setJobData({ ...jobData, experience_level: level })}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-200 p-6 rounded-md">
            <label className="block text-sm font-medium mb-2">Skills</label>
            <Input
              placeholder="Type..."
              className="bg-gray-300 border-none mb-4"
              onChange={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  handleSkillAdd(e.currentTarget.value.trim())
                  e.currentTarget.value = ""
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (value) {
                    handleSkillAdd(value)
                    ;(e.target as HTMLInputElement).value = ""
                  }
                }
              }}
            />

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Popular skills for some</p>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-gray-300 hover:bg-gray-400 cursor-pointer"
                    onClick={() => handleSkillAdd(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {jobData.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Selected skills</p>
                <div className="flex flex-wrap gap-2">
                  {jobData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-gray-100 pr-1 flex items-center">
                      {skill}
                      <button
                        type="button"
                        className="ml-1 rounded-full hover:bg-gray-300 h-4 w-4 inline-flex items-center justify-center"
                        onClick={() => handleSkillRemove(skill)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Salary */}
          <div className="bg-gray-200 p-6 rounded-md">
            <label className="block text-sm font-medium mb-2">Salary</label>
            <Input
              placeholder="$0.00"
              className="bg-gray-300 border-none"
              value={jobData.salary}
              onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
              required
            />
          </div>

          {/* Ask questions */}
          <div className="bg-gray-200 p-6 rounded-md">
            <label className="block text-sm font-medium mb-2">Ask questions</label>
            <Textarea
              placeholder="Type..."
              className="bg-gray-300 border-none resize-none h-24 mb-4"
              value={jobData.questions.join("\n")}
              onChange={(e) => setJobData({ ...jobData, questions: e.target.value.split("\n") })}
            />

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-gray-400"></span>
                <p>Séparez chaque question par un retour à la ligne.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-gray-400"></span>
                <p>Les questions aideront à filtrer les candidats les plus pertinents.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-gray-400"></span>
                <p>Essayez de poser des questions spécifiques à votre projet.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-300 hover:bg-gray-400"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              Enregistrer comme brouillon
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800 text-white" disabled={loading}>
              {loading ? "Publication en cours..." : "Publier l'offre"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

const experienceLevels = ["Entry Level", "Intermediate", "Expert", "Specialized"]

const popularSkills = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Product Management",
  "Content Writing",
  "Digital Marketing",
  "Data Analysis",
  "Project Management",
]
