"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, MoreHorizontal, Mail, MapPin, Shield, ShieldCheck, UserCheck, UserX } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { freelancersApi, type Freelancer } from "@/lib/api"

interface TransformedFreelancer {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  skills: string[]
  status: "active" | "inactive"
  joinDate: string
  avatar?: string
  rating?: number
  completedProjects?: number
  title?: string
  experienceLevel?: string
  bio?: string
  linkedin?: string
  github?: string
  website?: string
  isActive: boolean
}

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<TransformedFreelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFreelancers()
  }, [])

  const fetchFreelancers = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await freelancersApi.getAll()

      // Transformer les données pour l'affichage
      const transformedFreelancers = response.freelances.map((freelancer: Freelancer) => ({
        id: freelancer.id.toString(),
        name: `${freelancer.first_name} ${freelancer.last_name}`,
        email: freelancer.email,
        phone: "", // Pas dans l'API actuelle
        location: freelancer.location || "",
        skills:
          freelancer.skills && typeof freelancer.skills === "string"
            ? freelancer.skills
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : [],
        status: freelancer.is_active ? "active" : ("inactive" as const),
        joinDate: freelancer.created_at,
        avatar: "", // Pas dans l'API actuelle
        rating: 0, // Pas dans l'API actuelle
        completedProjects: 0, // Pas dans l'API actuelle
        title: freelancer.title || "",
        experienceLevel: freelancer.experience_level || "",
        bio: freelancer.bio || "",
        linkedin: freelancer.linkedin || "",
        github: freelancer.github || "",
        website: freelancer.website || "",
        isActive: freelancer.is_active,
      }))

      setFreelancers(transformedFreelancers)
    } catch (error: any) {
      console.error("Erreur lors du chargement des freelancers:", error)
      setError(error.message || "Erreur lors du chargement des freelancers")
    } finally {
      setLoading(false)
    }
  }

  const filteredFreelancers = freelancers.filter(
    (freelancer) =>
      freelancer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (freelancer.skills &&
        freelancer.skills.length > 0 &&
        freelancer.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <Badge variant="destructive" className="bg-red-600">
          <UserX className="mr-1 h-3 w-3" />
          Inactif/Banni
        </Badge>
      )
    }

    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            <UserCheck className="mr-1 h-3 w-3" />
            Actif
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary">
            <UserX className="mr-1 h-3 w-3" />
            Inactif
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleBanFreelancer = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir bannir ${name} ? Cette action peut être annulée plus tard.`)) {
      return
    }

    try {
      await freelancersApi.ban(id)
      // Recharger la liste
      fetchFreelancers()
    } catch (error: any) {
      console.error("Erreur lors du bannissement:", error)
      setError(`Erreur lors du bannissement: ${error.message}`)
    }
  }

  const handleUnbanFreelancer = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir débannir ${name} ?`)) {
      return
    }

    try {
      await freelancersApi.unban(id)
      // Recharger la liste
      fetchFreelancers()
    } catch (error: any) {
      console.error("Erreur lors du débannissement:", error)
      setError(`Erreur lors du débannissement: ${error.message}`)
    }
  }

  const handleToggleActive = async (id: string, name: string, isActive: boolean) => {
    const action = isActive ? "désactiver" : "activer"
    if (!confirm(`Êtes-vous sûr de vouloir ${action} ${name} ?`)) {
      return
    }

    try {
      await freelancersApi.toggleActive(id)
      // Recharger la liste
      fetchFreelancers()
    } catch (error: any) {
      console.error(`Erreur lors de l'${action}ation:`, error)
      setError(`Erreur lors de l'${action}ation: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Freelancers</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Freelancers</h1>
          <p className="text-muted-foreground">Gérez tous les freelancers de votre plateforme</p>
        </div>
        <Button>Ajouter un freelancer</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des freelancers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtres
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Freelancers ({filteredFreelancers.length})</CardTitle>
          <CardDescription>Tous les freelancers inscrits sur votre plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFreelancers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun freelancer trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Compétences</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFreelancers.map((freelancer) => (
                  <TableRow key={freelancer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={freelancer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {freelancer.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "FL"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{freelancer.name || "Nom non disponible"}</div>
                          <div className="text-sm text-muted-foreground">
                            {freelancer.title && `${freelancer.title} • `}
                            {freelancer.experienceLevel}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {freelancer.email}
                        </div>
                        {freelancer.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {freelancer.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{freelancer.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(freelancer.status, freelancer.isActive)}</TableCell>
                    <TableCell>{new Date(freelancer.joinDate).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {/* Actions d'activation/désactivation */}
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(freelancer.id, freelancer.name, freelancer.isActive)}
                            className={freelancer.isActive ? "text-orange-600" : "text-green-600"}
                          >
                            {freelancer.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Actions de bannissement */}
                          {!freelancer.isActive ? (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleUnbanFreelancer(freelancer.id, freelancer.name)}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Débannir
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleBanFreelancer(freelancer.id, freelancer.name)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Bannir
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
