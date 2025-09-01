"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Mail, Calendar, MapPin, Phone, Briefcase, Award, FileText, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { messageService } from "@/services/message-service"
import { freelanceService } from "@/services/api"

interface FreelanceProfileViewProps {
  freelanceId: string
  jobId?: string // Ajout d'un jobId optionnel pour le contexte de la conversation
}

const FreelanceProfileView = ({ freelanceId, jobId }: FreelanceProfileViewProps) => {
  const [freelance, setFreelance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contacting, setContacting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchFreelanceProfile = async () => {
      try {
        setLoading(true)
        console.log(`Récupération du profil freelance avec l'ID: ${freelanceId}`)

        // Utiliser le service API existant au lieu d'un endpoint local
        const response = await freelanceService.getFreelanceById(freelanceId)
        console.log("Données du profil reçues:", response.data)
        setFreelance(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil du freelance",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (freelanceId) {
      fetchFreelanceProfile()
    }
  }, [freelanceId, toast])

  // Fonction pour contacter le freelance
  const handleContact = async () => {
    if (!user?.id || !freelanceId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour contacter ce freelance",
        variant: "destructive",
      })
      return
    }

    try {
      setContacting(true)

      // Si nous n'avons pas de jobId, nous devons en créer un ou utiliser un ID de conversation générique
      const conversationJobId = jobId || "general"

      // Envoyer un message initial pour créer la conversation
      const initialMessage = {
        sender_id: user.id,
        receiver_id: freelanceId,
        job_id: conversationJobId,
        content: "Bonjour, je suis intéressé par votre profil pour notre offre d'emploi.",
      }

      await messageService.sendMessage(initialMessage)

      // Rediriger vers la page de messagerie
      router.push(`/messages/${conversationJobId}/${freelanceId}`)

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
      setContacting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!freelance) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>Impossible de trouver le profil du freelance.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {/* Navigation */}
      <Link href="/company/jobs" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Retour aux talents
      </Link>

      {/* En-tête du profil */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${freelance.first_name}`} />
              <AvatarFallback>{`${freelance.first_name?.charAt(0)}${freelance.last_name?.charAt(0)}`}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {freelance.first_name} {freelance.last_name}
              </h1>
              <p className="text-gray-600">{freelance.title || "Freelance"}</p>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{freelance.location || "Non spécifié"}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis {new Date(freelance.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Button
              onClick={handleContact}
              className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
              disabled={contacting}
            >
              {contacting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Création de la conversation...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </>
              )}
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href={`mailto:${freelance.email}`}>
                <Mail className="h-4 w-4" />
                Envoyer un email
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu du profil */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="experience">Expérience</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger> 
        </TabsList>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>À propos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{freelance.bio || "Aucune information disponible."}</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Coordonnées</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${freelance.email}`} className="text-gray-700 hover:underline">
                        {freelance.email}
                      </a>
                    </div>
                    {freelance.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a href={`tel:${freelance.phone_number}`} className="text-gray-700 hover:underline">
                          {freelance.phone_number}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Informations professionnelles</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{freelance.experience_level || "Non spécifié"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{freelance.hourly_rate || "Taux non spécifié"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Expérience professionnelle</CardTitle>
            </CardHeader>
            <CardContent>
              {freelance.experiences && freelance.experiences.length > 0 ? (
                <div className="space-y-6">
                  {freelance.experiences.map((exp: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-gray-500 text-sm mb-2">
                        {new Date(exp.start_date).toLocaleDateString()} -{" "}
                        {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : "Présent"}
                      </p>
                      <p className="text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucune expérience professionnelle renseignée.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Compétences</CardTitle>
            </CardHeader>
            <CardContent>
              {freelance.skills && freelance.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {freelance.skills.map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      variant={skill.is_top_skill ? "default" : "outline"}
                      className={skill.is_top_skill ? "bg-black text-white" : "bg-gray-100 text-gray-800"}
                    >
                      {typeof skill === "string" ? skill : skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucune compétence renseignée.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

       <TabsContent value="cv">
  <Card>
    <CardHeader>
      <CardTitle>Curriculum Vitae</CardTitle>
    </CardHeader>
    <CardContent>
      {freelance.cv_url ? (
        <div>
          <p className="mb-4">Cliquez ci-dessous pour visualiser ou télécharger le CV :</p>
          <a
            href={`http://localhost:5000/${freelance.cv_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Télécharger le CV
          </a>
        </div>
      ) : (
        <p className="text-gray-600">Aucun CV n’a été fourni par ce freelance.</p>
      )}
    </CardContent>
  </Card>
</TabsContent>

      </Tabs>
    </div>
  )
}

export default FreelanceProfileView
