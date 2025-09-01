"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, FileText, MapPin, Star, User, Wrench } from "lucide-react"
import { GeneralProfileForm } from "@/components/profile/general-profile-form"
import { RolesManagement } from "@/components/profile/roles-management"
import { SkillsManagement } from "@/components/profile/skills-management"
import { ExperienceManagement } from "@/components/profile/experience-management"
import { CVUpload } from "@/components/profile/cv-upload"
import { freelanceService } from "@/services/api"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Types pour les données du profil
interface FreelanceProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  title: string
  experience_level: string
  bio: string
  location: string
  linkedin: string
  github: string
  website: string
  avatar: string
  cv_url: string
  roles: {
    id: number
    role: string
    years_of_experience: number
    is_primary: boolean
  }[]
  skills: {
    id: number
    skill: string
    is_top_skill: boolean
  }[]
  experiences: {
    id: number
    title: string
    company: string
    start_date: string
    end_date: string | null
    currently_working: boolean
    description: string
  }[]
}

export default function FreelanceProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<FreelanceProfile | null>(null)
  const [skills, setSkills] = useState<{ id: number; skill: string; is_top_skill: boolean }[]>([])

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const handleDeleteRole = async (roleId: number) => {
    try {
      await freelanceService.deleteRole(roleId)
      await refreshProfile()
    } catch (error) {
      console.error("Erreur lors de la suppression du rôle :", error)
    }
  }

  // Modales
  const [generalModalOpen, setGeneralModalOpen] = useState(false)
  const [rolesModalOpen, setRolesModalOpen] = useState(false)
  const [skillsModalOpen, setSkillsModalOpen] = useState(false)
  const [experienceModalOpen, setExperienceModalOpen] = useState(false)
  const [cvModalOpen, setCvModalOpen] = useState(false)

  // Charger les données du profil
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)

        // Appel de l'API pour le profil
        const response = await freelanceService.getFreelanceProfile()
        setProfile(response.data)

        // Appel séparé pour les compétences avec ID
        const skillsRes = await freelanceService.getSkills()
        setSkills(skillsRes.data)
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user, router])

  // Fonction pour rafraîchir les données du profil
  const refreshProfile = async () => {
    try {
      setLoading(true)
      const response = await freelanceService.getFreelanceProfile()
      setProfile(response.data)
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du profil:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p className="text-xl text-gray-600">Profil non disponible</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mon Profil Professionnel</h1>
        <p className="text-gray-500">Gérez vos informations professionnelles et votre visibilité</p>
      </div>

      {/* Rest of the component remains the same */}
      {/* En-tête du profil */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24 border-2 border-gray-200">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xl">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-lg text-gray-600">{profile.title || "Aucun titre spécifié"}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                {profile.location && (
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.experience_level && (
                  <Badge variant="outline" className="ml-2">
                    {profile.experience_level}
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setGeneralModalOpen(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Modifier le profil
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCvModalOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  {profile.cv_url ? "Mettre à jour le CV" : "Ajouter un CV"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets du profil */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="roles">Rôles professionnels</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
          <TabsTrigger value="experiences">Expériences</TabsTrigger>
        </TabsList>

        {/* Onglet Informations générales */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Informations générales</CardTitle>
                <Button variant="outline" onClick={() => setGeneralModalOpen(true)}>
                  Modifier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Bio</h3>
                <p className="mt-1 text-gray-600">{profile.bio || "Aucune bio spécifiée"}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Localisation</h3>
                  <p className="mt-1 text-gray-600">{profile.location || "Non spécifiée"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Niveau d'expérience</h3>
                  <p className="mt-1 text-gray-600">{profile.experience_level || "Non spécifié"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-gray-700">Liens</h3>
                <div className="mt-2 space-y-2">
                  {profile.website && (
                    <div className="flex items-center">
                      <span className="font-medium w-24">Site web:</span>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.linkedin && (
                    <div className="flex items-center">
                      <span className="font-medium w-24">LinkedIn:</span>
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.linkedin}
                      </a>
                    </div>
                  )}
                  {profile.github && (
                    <div className="flex items-center">
                      <span className="font-medium w-24">GitHub:</span>
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.github}
                      </a>
                    </div>
                  )}
                  {!profile.website && !profile.linkedin && !profile.github && (
                    <p className="text-gray-500">Aucun lien spécifié</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Rôles professionnels */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Rôles professionnels</CardTitle>
                <Button variant="outline" onClick={() => setRolesModalOpen(true)}>
                  Gérer les rôles
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.roles && profile.roles.length > 0 ? (
                <div className="space-y-4">
                  {profile.roles.map((role) => (
                    <div key={role.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {role.role}
                            {role.is_primary && <Badge className="ml-2 bg-amber-500">Principal</Badge>}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {role.years_of_experience} {role.years_of_experience > 1 ? "années" : "année"} d'expérience
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteRole(role.id)}
                            title="Supprimer ce rôle"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun rôle professionnel spécifié</p>
                  <Button variant="outline" className="mt-4" onClick={() => setRolesModalOpen(true)}>
                    Ajouter des rôles
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Compétences */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Compétences</CardTitle>
                <Button variant="outline" onClick={() => setSkillsModalOpen(true)}>
                  Gérer les compétences
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.skills && profile.skills.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-3">Compétences principales</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile.skills
                      .filter((skill) => skill.is_top_skill)
                      .map((skill, index) => (
                        <Badge key={index} className="bg-amber-500 hover:bg-amber-600">
                          <Star className="h-3 w-3 mr-1" />
                          {skill.skill}
                        </Badge>
                      ))}
                    {profile.skills.filter((skill) => skill.is_top_skill).length === 0 && (
                      <p className="text-gray-500">Aucune compétence principale spécifiée</p>
                    )}
                  </div>

                  <h3 className="font-medium mb-3">Autres compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills
                      .filter((skill) => !skill.is_top_skill)
                      .map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill.skill}
                        </Badge>
                      ))}
                    {profile.skills.filter((skill) => !skill.is_top_skill).length === 0 && (
                      <p className="text-gray-500">Aucune compétence secondaire spécifiée</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune compétence spécifiée</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSkillsModalOpen(true)}>
                    Ajouter des compétences
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Expériences */}
        <TabsContent value="experiences">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Expériences professionnelles</CardTitle>
                <Button variant="outline" onClick={() => setExperienceModalOpen(true)}>
                  Gérer les expériences
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-6">
                  {profile.experiences.map((exp, index) => (
                    <div key={exp.id || index} className="border-l-2 border-gray-200 pl-4 relative">
                      <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[7px] top-1"></div>
                      <h3 className="font-medium text-lg">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(exp.start_date).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })} -
                        {exp.currently_working
                          ? " Présent"
                          : exp.end_date
                            ? ` ${new Date(exp.end_date).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}`
                            : " Non spécifié"}
                      </p>
                      <p className="mt-2 text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune expérience professionnelle spécifiée</p>
                  <Button variant="outline" className="mt-4" onClick={() => setExperienceModalOpen(true)}>
                    Ajouter des expériences
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales pour l'édition */}
      <GeneralProfileForm
        open={generalModalOpen}
        onOpenChange={setGeneralModalOpen}
        profile={profile}
        onSuccess={refreshProfile}
      />

      <RolesManagement
        open={rolesModalOpen}
        onOpenChange={setRolesModalOpen}
        roles={profile.roles || []}
        onSuccess={refreshProfile}
      />

      <SkillsManagement
        open={skillsModalOpen}
        onOpenChange={setSkillsModalOpen}
        skills={skills}
        onSuccess={async () => {
          const res = await freelanceService.getSkills()
          setSkills(res.data)
        }}
      />

      <ExperienceManagement
        open={experienceModalOpen}
        onOpenChange={setExperienceModalOpen}
        experiences={profile.experiences || []}
        onSuccess={refreshProfile}
      />

      <CVUpload
        open={cvModalOpen}
        onOpenChange={setCvModalOpen}
        currentCvUrl={profile.cv_url}
        onSuccess={refreshProfile}
      />
    </div>
  )
}
